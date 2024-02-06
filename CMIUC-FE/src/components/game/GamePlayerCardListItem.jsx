import cardBack from "../../assets/image/game/cardBack.png";
import { useContext, useEffect } from "react";
import { GameContext } from "./GameLogic";
import { CardInfoMap } from "../../map/game/CardInfoMap";

export const GamePlayerCardListItem = ({ cards, memberId }) => {
  const {
    stompClient,
    gameId,
    curTurn,
    playerInfo,
    setPlayerInfo,
    round,
    tableCard,
    setTableCard,
    cardType,
    setCardType,
    roundCard,
    setRoundCard,
  } = useContext(GameContext);

  // useEffect(() => {}, [playerInfo]);

  const cardDeck = cards;
  const hasCardPlayer = memberId;

  // NOTE : 자기 자신의 카드를 선택하는 유저의 정보
  const findSelfPlayer = playerInfo.find((user, _) => {
    if (user.order === curTurn) {
      return user;
    }
  });

  // NOTE : 객체의 value로 key를 찾는 함수
  const findKeyByValueInArray = (obj, value) => {
    for (const key in obj) {
      if (obj[key].find((target) => target === value)) {
        return key;
      }
    }
    return null; // 값을 찾지 못한 경우
  };

  const sendCardInfo = (nextTurn, openCardNum) => {
    console.log(gameId);
    stompClient.send(
      `/pub/games/${gameId}/pick-card`,
      {
        accessToken: localStorage.getItem("accessToken"),
      },
      JSON.stringify({
        nextTurn: nextTurn,
        openCardNum: openCardNum,
      })
    );
  };

  const onClickHandler = (e, clickedCardIndex) => {
    // NOTE : 유저 정보를 담고있는 객체 복사
    let copiedPlayerInfo = [...playerInfo];
    console.log("유저 정보", copiedPlayerInfo);
    // NOTE : 클릭이벤트가 발생한 카드를 가지고 있는 유저의 INDEX
    let findPlayerIndex = copiedPlayerInfo.findIndex(
      (player) => player.memberId === hasCardPlayer
    );
    console.log(
      "클릭이벤트가 발생한 카드를 가지고 있는 유저의 INDEX",
      findPlayerIndex
    );
    // NOTE : 클릭이벤트가 발생한 카드를 가지고 있는 유저
    let copiedPlayer = copiedPlayerInfo[findPlayerIndex];
    console.log(
      "클릭이벤트가 발생한 유저",
      copiedPlayer,
      "현재 차례인 유저",
      findSelfPlayer
    );
    // NOTE: 만약 클릭한 사용자가 isFirstPlayer가 아니면 함수를 종료
    // if (copiedPlayer.memberId === findSelfPlayer.memberId) {
    //   return;
    // } else {
    // NOTE : 클릭이벤트가 발생한 유저의 카드 리스트
    let copiedCardDeck = [...cardDeck];
    // NOTE : 클릭 이벤트를 통해 선택한 카드
    const drawCard = copiedCardDeck[clickedCardIndex];
    // NOTE : 클릭 이벤트를 통해 선택한 카드의 종류
    const cardTypeKey = findKeyByValueInArray(
      CardInfoMap(playerInfo.length),
      drawCard
    );
    // NOTE : 카드 종류에 따라 카드 타입을 업데이트
    setCardType({
      ...cardType,
      [cardTypeKey]: cardType[cardTypeKey].concat(drawCard),
    });
    // NOTE : 현재 라운드에 해당하는 roundCard에 카드 타입에 맞게 카드 추가
    setRoundCard({
      ...roundCard,
      [round - 1]: {
        ...roundCard[round - 1],
        [cardTypeKey]: roundCard[round - 1][cardTypeKey].concat(drawCard),
      },
    });
    // NOTE : 클릭 이벤트를 통해 선택한 카드를 유저의 카드 리스트에서 제거
    // copiedCardDeck.splice(clickedCardIndex, 1);
    // NOTE : 유저의 카드 리스트를 업데이트
    // copiedPlayer.cards = copiedCardDeck;
    // NOTE : 유저 정보를 업데이트
    // copiedPlayerInfo[findPlayerIndex] = copiedPlayer;
    // NOTE : 클릭이벤트가 발생한 카드를 가지고 있는 유저의 isFirstPlayer를 true로 변경
    // let newCopiedPlayerInfo = copiedPlayerInfo.map((player, index) => {
    //   if (index === findPlayerIndex) {
    //     return { ...player, isFirstPlayer: true };
    //   } else {
    //     return { ...player, isFirstPlayer: false };
    //   }
    // });
    // console.log(newCopiedPlayerInfo);
    sendCardInfo(copiedPlayer.memberId, drawCard);
    // NOTE : 전체 유저 정보를 업데이트
    // setPlayerInfo(newCopiedPlayerInfo);
    // NOTE : 테이블 카드 배열을 복사
    let newTableCard = [...tableCard];
    // NOTE : 테이블 카드 배열에 클릭 이벤트를 통해 선택한 카드를 추가
    newTableCard = newTableCard.concat(drawCard);
    // 새로운 테이블 카드 배열을 업데이트
    setTableCard(newTableCard);
    // }
  };
  return (
    <>
      {cardDeck.map((card, index) => (
        // NOTE : 카드 className text-black/0 추가하기 -> 텍스트 투명 설정
        <div
          style={{ backgroundImage: `url("${cardBack}")` }}
          className="w-[50px] h-[80px] bg-cover bg-center cursor-pointer -mx-[10px] brightness-[0.8] hover:brightness-100 hover:-translate-y-[10px] hover:scale-[1.2] hover:z-10 transition-all duration-300 ease-in-out"
          key={index}
          onClick={(e) => onClickHandler(e, index)}
        >
          {card}
        </div>
      ))}
    </>
  );
};
