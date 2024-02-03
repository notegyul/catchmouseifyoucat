import "./App.css";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Layout from "./layouts/Layout.jsx";
import Home from "./pages/Home.jsx";
import Game from "./pages/Game.jsx";
import Lobby from "./pages/Lobby.jsx";

import GameChatConnect from "./components/gamechat/GameChatConnect.jsx";
import KakaoRedirectPage from "./components/login/KakaoRedirectPage.jsx";
import NaverRedirectPage from "./components/login/NaverRedirectPage.jsx";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/callback/naver" element={<NaverRedirectPage />} />
        <Route path="/callback/kakao" element={<KakaoRedirectPage />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/game/chat/:roomId" element={<GameChatConnect />} />

        {/* <Route path="/user/kakao" component={KakaoCallback} /> */}
        {/* <Route path={'/'} element={<MainPage />} />
          <Route path={'/room/:roomId'} element={<GameRoom />} />
          <Route path={'/settings'} element={<Setting />} /> */}
      </Routes>
    </Layout>
  );
}

export default App;
