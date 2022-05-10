import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Player from "./Player";
import UserContext from "../UserContext";

import Box from "@mui/material/Box";

import { auth, storage } from "../FireBaseAppData";
import { signOut } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import axios from 'axios';

function Lobby() {
  const { uid } = React.useContext(UserContext);

  const navigate = useNavigate();

  const [colors, setColors] = useState(["Red", "Blue", "Green", "Yellow"]);
  const [players, setPlayers] = useState([
    {
      id: 1,
      col: "White",
      lock: false,
    },
    {
      id: 2,
      col: "White",
      lock: false,
    },
    {
      id: 3,
      col: "White",
      lock: false,
    },
    {
      id: 4,
      col: "White",
      lock: false,
    },
  ]);
  const [profileImg, setprofileImg] = useState("https://cdn-icons-png.flaticon.com/512/149/149071.png");
  const [uploadShown, setuploadShown] = useState(false);
  const [imageUpload, setImageUpload] = useState(null);
  const [imagePath, setimagePath] = useState("");

  const loadUserData = async () => {
    ////
    const res = await axios({
      method: 'get',
      url: 'http://localhost:5000/getuser',
      params: {
        uid: uid
      }
    });
    ////
    console.log('res', res);
    setPlayers(res.data.players);
    setColors(res.data.colors);
    setprofileImg(res.data.userImg);
  }

  const updatePlayersColors = async (playersNew, colorsNew) => {
    const res = await axios({
      method: 'post',
      url: 'http://localhost:5000/updatePlayersColors',
      data: {
        uid: uid,
        players: playersNew,
        colors: colorsNew,
      }
    });
    console.log('res', res);
  }

  const updateUserImg = async (UserImgNew) => {
    const res = await axios({
      method: 'post',
      url: 'http://localhost:5000/updateUserImg',
      data: {
        uid: uid,
        userImg: UserImgNew
      }
    });
    console.log('res', res);
  }

  useEffect(() => {
    if (uid === undefined) {
      navigate("/");
      return;
    }
    loadUserData();
  }, [uid, navigate]);

  const toggleColor = (id, newColor) => {
    if (!colors.includes(newColor)) {
      return;
    }
    let newArr = [...players];
    for (let i = 0; i < players.length; i++) {
      const element = newArr[i];
      if (id === element.id) {
        newArr[i].col = newColor;
        if (newColor !== "Select") {
          newArr[i].lock = newArr[i].lock ? false : true;
        } else {
          newArr[i].lock = false;
        }
        break;
      }
    }
    setPlayers(newArr);
    let newColorArr = colors.filter((ele) => ele !== newColor);
    setColors(newColorArr);

    updatePlayersColors(newArr, newColorArr);
  };

  const unlockAll = () => {

    let newArr = [
      {
        id: 1,
        col: "White",
        lock: false,
      },
      {
        id: 2,
        col: "White",
        lock: false,
      },
      {
        id: 3,
        col: "White",
        lock: false,
      },
      {
        id: 4,
        col: "White",
        lock: false,
      },
    ];
    let newcol = ["Red", "Blue", "Green", "Yellow"];
    setPlayers(newArr);
    setColors(newcol);

    updatePlayersColors(newArr, newcol);
  };

  const logout = () => {
    signOut(auth)
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  };

  const uploadImgButton = () => {setuploadShown(true)};
  const uploadImg = () => {
    if (imageUpload === null){
      return;
    }

    const imageRef = ref(storage, `profilePics/${uid}`);
    console.log('imageUpload', imageUpload);
    uploadBytes(imageRef, imageUpload).then(() => {
      getDownloadURL(imageRef).then((url) => {
        setprofileImg(url);
        updateUserImg(url);
      })
    });

  };

  return (
    <Box>
      <div className="profile-logout">
        <div className="upload-img" onClick={uploadImgButton}>
          Upload Profile Img
        </div>
        <div className="logout-button" onClick={logout}>
          Log Out
        </div>
        <div className="profile-pics">
          <img src={profileImg} alt="Profile" />
        </div>
      </div>

      <Box sx={{ display: "flex", flexDirection: "row" }}>
        {players.map((ele) => (
          <Player
            key={ele.id}
            colorsArr={colors}
            player={ele}
            toggleLock={toggleColor}
          />
        ))}
      </Box>
      <div className="unlock-all-button" onClick={unlockAll}>
          Unlock All
      </div>
      <Box>
        <Box sx={uploadShown ? {visibility: 'visible'} : {visibility: 'hidden'}} className="upload-img-pop">
          <div className="pop-up-box">
            <label class="custom-file-upload" onChange={(e) => {setImageUpload(e.target.files[0]); setimagePath(e.target.files[0].name)}}>
                <input type="file"/>
                Choose File
            </label>
            <div className="img-path">{imagePath}</div>
            
            <div className="uploadImg-btn" onClick={uploadImg}>Upload Image</div>
            <div onClick={() => setuploadShown(false)} className="close-button">Close</div>
          </div>
        </Box>
      </Box>
    </Box>
  );
}

export default Lobby;
