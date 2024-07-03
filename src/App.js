import React, { useState, useEffect } from 'react';
import axios from 'axios';

const clientId = 'CLIENT_ID';
const clientSecret = 'CLIENT_SECRET';
const redirectUri = 'REDIRECT_URI';
const scope = 'identify guilds';

const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;

function App() {
  const [userInfo, setUserInfo] = useState(null);
  const [userGuilds, setUserGuilds] = useState(null);

  const handleLogin = () => {
    window.location.href = authUrl;
  };

  const handleFetchUser = async (code) => {
    try {
      const params = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        scope: scope
      });

      const responseToken = await axios.post('https://discord.com/api/oauth2/token', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const accessToken = responseToken.data.access_token;

      const responseUser = await axios.get('https://discord.com/api/users/@me', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const responseGuilds = await axios.get('https://discord.com/api/users/@me/guilds', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      setUserInfo(responseUser.data);
      setUserGuilds(responseGuilds.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      handleFetchUser(code);
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        {!userInfo ? (
          <button onClick={handleLogin}>Discord ile Giriş Yap</button>
        ) : (
          <div>
            <h2>Discord Kullanıcı Bilgileri</h2>
            <p>Kullanıcı Adı: {userInfo.username}</p>
            <h2>Discord Kullanıcının Bulunduğu Sunucular</h2>
            {!userGuilds ? (
              <p>Sunucular yükleniyor...</p>
            ) : (
              <ul>
                {userGuilds.map(guild => (
                  <li key={guild.id}>{guild.name}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
