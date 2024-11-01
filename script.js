console.log("lets write javascript ");
let currentsong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  //show all the songs in the playlists
  let songUL = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
        <img class="invert" src="images/music.svg" alt="music">
                <div class="info">
                  <div>${song.replaceAll("%20", " ")} </div>
                  <div>Vinay</div>
                </div>
                <div class="playnow">
                  <span>Play Now</span>
                  <img class="invert" style="height: 15px;width:15px;" src="images/playsong.svg" alt="">
                </div>
         </li>`;
  }

  // //play the 1st song
  // var audio = new Audio(songs[0]);
  // //audio.play();

  // audio.addEventListener("loadeddata", () => {
  //     let duration = audio.duration;
  //     console.log(audio.duration,audio.currentSrc,audio.currentTime);
  //     console.log(parseInt(duration/60) + ":"+ parseInt(duration%60) + "\nseconds:" + duration);
  // });

  //attach an event listener to each song
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs;
}

const playmusic = (track, pause = false) => {
  //let audio = new Audio("songs/[isongs.info] - "+track);
  currentsong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentsong.play();
    play.src = "images/pause.svg";
    document.getElementById("play").style = "margin-bottom:0px";
  }
  document.querySelector(".song-info").innerHTML = decodeURI(track);
  document.querySelector(".song-time").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:3000/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".card-container");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0];

      //get the meta data of the folder
      let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
      let response = await a.json();
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card">
              <div class="play-card">
                <div class="play">
                  <i class="fa-solid fa-play"></i>
                </div>
              </div>
              <img
                src="/songs/${folder}/cover.jpg"
                alt=""
              />
              <h3>${response.title}</h3>
              <p>${response.description}</p>
            </div>`;
    }
  }
  // load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    console.log(e);
    e.addEventListener("click", async (item) => {
      console.log("Fetching songs");
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      
      //lets you play first song of the album
      playmusic(songs[0]);
    });
  });
}

async function main() {
  //get the list of all songs
  await getSongs("songs/Animal");
  playmusic(songs[0], true);

  //display all the albums on the page
  displayAlbums();

  //Attach an event listener to play ,next and previous
  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "images/pause.svg";
      document.getElementById("play").style = "margin-bottom:0px";
    } else {
      currentsong.pause();
      play.src = "images/playsong.svg";
      document.getElementById("play").style = "margin-bottom:2.5px";
    }
  });

  //listen for timeupdate event
  currentsong.addEventListener("timeupdate", () => {
    //console.log(currentsong.currentTime,currentsong.duration);
    document.querySelector(".song-time").innerHTML = `${secondsToMinutesSeconds(
      currentsong.currentTime
    )} / ${secondsToMinutesSeconds(currentsong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 99 + "%";
  });

  //add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = (currentsong.duration * percent) / 100;
  });

  //add an event listener to hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  //add an event listener to close
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-125%";
  });

  //add an event listener to the previous button
  previous.addEventListener("click", () => {
    currentsong.pause();
    console.log("previous is clicked");

    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playmusic(songs[index - 1]);
    }
  });

  //add an event listener to the next button
  next.addEventListener("click", () => {
    currentsong.pause();
    console.log("next is clicked");

    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playmusic(songs[index + 1]);
    }
  });

  //add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("setting volume to", e.target.value, "/ 100");
      currentsong.volume = parseInt(e.target.value) / 100;
      if(currentsong.volume > 0){
        document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg","volume.svg");
      }
      if (currentsong.volume > 0.7) {
        document
          .querySelector(".range")
          .getElementsByTagName("input")[0].style.filter =
          "hue-rotate(180deg) saturate(700%) brightness(90%)";
        alert("Hearing at high volume leads to hear loss");
      } else {
        document
          .querySelector(".range")
          .getElementsByTagName("input")[0].style.filter =
          "hue-rotate(270deg) saturate(100%)";
      }
    });

  //add event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    //console.log(e.target);
    //console.log("changing",e.target.src);
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentsong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value= 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentsong.volume = 0.3;
      document.querySelector(".range").getElementsByTagName("input")[0].value= 30;

    }
  });
}
main();
