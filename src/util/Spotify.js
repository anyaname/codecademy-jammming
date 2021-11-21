let token;
let expiresIn;
let client_id = "7e1088eedb194f55a7abe3234be3dd72";
let redirect_uri = "http://annaname.surge.sh/";
let scope = "playlist-modify-public";

let url = "https://accounts.spotify.com/authorize";
url += "?response_type=token";
url += "&client_id=" + encodeURIComponent(client_id);
url += "&scope=" + encodeURIComponent(scope);
url += "&redirect_uri=" + encodeURIComponent(redirect_uri);

const Spotify = {
  getAccessToken() {
    console.log(token);
    if (token) return token;
    console.log("after" + token);
    const tokenUrl = window.location.href.match(/access_token=([^&]*)/);
    const expiresInUrl = window.location.href.match(/expires_in=([^&]*)/);

    if (tokenUrl && expiresInUrl) {
      token = tokenUrl[1];
      expiresIn = expiresInUrl[1];
      window.setTimeout(() => (token = ""), expiresIn * 1000);
      window.history.pushState("Access Token", null, "/");
    } else {
      window.location = url;
    }
    console.log(token);
  },

  search(term) {
    const searchUrl = `https://api.spotify.com/v1/search?type=track&q=${term.replace(
      " ",
      "%20"
    )}`;
    return fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((jsonResponse) => {
        if (!jsonResponse.tracks) return [];
        return jsonResponse.tracks.items.map((track) => {
          return {
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            uri: track.uri,
          };
        });
      });
  },
  savePlaylist(playListName, URIs) {
    if (!playListName || !URIs || URIs.length === 0) return;

    const userUrl = "https://api.spotify.com/v1/me";
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    let userID;
    let playlistID;
    // get user id
    fetch(userUrl, {
      headers: headers,
    })
      .then((response) => response.json())
      .then((jsonResponse) => {
        userID = jsonResponse.id;
      })
      .then(() => {
        const playlistUrl = `https://api.spotify.com/v1/users/${userID}/playlists`;
        // create playlist
        fetch(playlistUrl, {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            name: playListName,
          }),
        })
          .then((response) => response.json())
          .then((jsonResponse) => {
            playlistID = jsonResponse.id;
          })
          .then(() => {
            // add tracks to playlist
            const addTracksUrl = `https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`;

            fetch(addTracksUrl, {
              method: "POST",
              headers: headers,
              body: JSON.stringify({
                uris: URIs,
              }),
            });
          });
      });
  },
};

export default Spotify;
