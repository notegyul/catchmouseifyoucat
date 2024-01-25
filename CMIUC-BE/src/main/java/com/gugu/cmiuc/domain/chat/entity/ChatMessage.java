package com.gugu.cmiuc.domain.chat.entity;

import com.gugu.cmiuc.domain.member.entity.Member;
import com.gugu.cmiuc.global.entity.BaseEntity;
import com.gugu.cmiuc.global.entity.CheckType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class ChatMessage extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chat_message_id")
    private Long id;

    private String content;

    @Enumerated(EnumType.STRING)
    private CheckType checkType;

    @ManyToOne
    @JoinColumn(name = "member_id")
    private Member member;

    @ManyToOne
    @JoinColumn(name = "chat_room_id")
    private ChatRoom chatRoom;

}
