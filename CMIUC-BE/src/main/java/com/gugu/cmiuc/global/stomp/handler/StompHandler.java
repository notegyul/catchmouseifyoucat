package com.gugu.cmiuc.global.stomp.handler;

import com.gugu.cmiuc.global.config.JwtTokenProvider;
import com.gugu.cmiuc.domain.chat.dto.FriendChatMessageDTO;
import com.gugu.cmiuc.global.stomp.dto.DataDTO;
import com.gugu.cmiuc.global.stomp.repository.StompRepository;
import com.gugu.cmiuc.global.stomp.service.StompService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.Optional;

@Slf4j
@RequiredArgsConstructor
@Component
public class StompHandler implements ChannelInterceptor {

    private final JwtTokenProvider jwtTokenProvider;
    private final StompRepository stompRepository;
    private final StompService stompService;

    // websocket을 통해 들어온 요청이 처리 되기전 실행된다.
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {

        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (StompCommand.CONNECT == accessor.getCommand()) { // websocket 연결요청

            log.info("payload : {}", message);

            String jwtToken = accessor.getFirstNativeHeader("token");
            log.info("CONNECT {}", jwtToken);

            // Header의 jwt token 검증
            jwtTokenProvider.validateToken(jwtToken);

        } else if (StompCommand.SUBSCRIBE == accessor.getCommand()) { // 채팅룸 구독요청

            // header정보에서 구독 destination정보를 얻고, roomId를 추출한다.
            String roomId = stompService.getRoomId(Optional.ofNullable((String) message.getHeaders().get("simpDestination")).orElse("InvalidRoomId"));

            // 채팅방에 들어온 클라이언트 sessionId를 roomId와 맵핑해 놓는다.(나중에 특정 세션이 어떤 채팅방에 들어가 있는지 알기 위함)
            String sessionId = (String) message.getHeaders().get("simpSessionId");
            stompRepository.setUserEnterInfo(sessionId, roomId);

            // 채팅방의 인원수를 +1한다.
            stompRepository.plusUserCount(roomId);

            // 클라이언트 입장 메시지를 채팅방에 발송한다.(redis publish)
            String name = Optional.ofNullable((Principal) message.getHeaders().get("simpUser")).map(Principal::getName).orElse("UnknownUser");

            stompService.sendChatMessage(
                    DataDTO.builder()
                            .type(DataDTO.DataType.EXIT)
                            .roomId(roomId)
                            .data(FriendChatMessageDTO.builder().sender(name).message(name + "님이 방에 입장했습니다").build())
                            .build());

            log.info("SUBSCRIBED {}, {}", name, roomId);

        } else if (StompCommand.DISCONNECT == accessor.getCommand()) { // Websocket 연결 종료
            // 연결이 종료된 클라이언트 sesssionId로 채팅방 id를 얻는다.
            String sessionId = (String) message.getHeaders().get("simpSessionId");
            String roomId = stompRepository.getUserEnterRoomId(sessionId);

            // 채팅방의 인원수를 -1한다.
            stompRepository.minusUserCount(roomId);

            // 클라이언트 퇴장 메시지를 채팅방에 발송한다.(redis publish)
            String name = Optional.ofNullable((Principal) message.getHeaders().get("simpUser")).map(Principal::getName).orElse("UnknownUser");

            stompService.sendChatMessage(
                    DataDTO.builder()
                            .type(DataDTO.DataType.EXIT)
                            .roomId(roomId)
                            .data(FriendChatMessageDTO.builder().sender(name).message(name + "님이 방에서 나갔습니다").build())
                            .build());


            // 퇴장한 클라이언트의 roomId 맵핑 정보를 삭제한다.
            stompRepository.removeUserEnterInfo(sessionId);
            log.info("DISCONNECTED {}, {}", sessionId, roomId);
        }
        return message;
    }
}