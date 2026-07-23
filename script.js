/*
=====================================
 スクラッチゲーム

 script.js

 1/3

 ・初期設定
 ・状態管理
 ・画像読み込み

=====================================
*/


/*
=====================================
 DOM取得
=====================================
*/


const uploadArea =
  document.getElementById("uploadArea");


const imageInput =
  document.getElementById("imageInput");


const gameArea =
  document.getElementById("gameArea");


const imageCanvas =
  document.getElementById("imageCanvas");


const scratchCanvas =
  document.getElementById("scratchCanvas");


const instruction =
  document.getElementById("instruction");


const message =
  document.getElementById("message");


const resetButton =
  document.getElementById("resetButton");


const resetUploadButton =
  document.getElementById("resetUploadButton");







/*
=====================================
 Canvas

=====================================
*/


const imageContext =
  imageCanvas.getContext("2d");


const scratchContext =
  scratchCanvas.getContext("2d");









/*
=====================================
 状態管理
=====================================
*/


const GAME_STATE = {


  BEFORE_UPLOAD:

    "before-upload",



  SCRATCHING:

    "scratching",



  COMPLETE:

    "complete"


};





let currentState =

  GAME_STATE.BEFORE_UPLOAD;









/*
=====================================
 ゲームデータ
=====================================
*/


let loadedImage = null;



let isScratching = false;



let scratchEnabled = false;






const canvasSize = 500;






/*
 幼児向けブラシサイズ

 指で操作しやすい大きさ

*/


const brushSize = 55;






/*
 70%削れたら完成

*/


const completeRate = 0.7;









/*
=====================================
 初期状態

=====================================
*/


setGameState(

  GAME_STATE.BEFORE_UPLOAD

);









/*
=====================================
 イベント登録
=====================================
*/


imageInput.addEventListener(

  "change",

  loadImage

);





resetButton.addEventListener(

  "click",

  restartGame

);





resetUploadButton.addEventListener(

  "click",

  resetGame

);









/*
=====================================
 表示状態変更
=====================================
*/


function setGameState(state){



  currentState = state;







  switch(state){



    case GAME_STATE.BEFORE_UPLOAD:



      uploadArea.hidden = false;



      gameArea.hidden = true;



      resetButton.hidden = true;



      resetUploadButton.hidden = true;



      instruction.textContent = "";



      message.textContent = "";



      break;







    case GAME_STATE.SCRATCHING:



      uploadArea.hidden = true;



      gameArea.hidden = false;



      resetButton.hidden = true;



      resetUploadButton.hidden = false;



      break;







    case GAME_STATE.COMPLETE:



      uploadArea.hidden = true;



      gameArea.hidden = false;



      resetButton.hidden = false;



      resetUploadButton.hidden = false;



      break;



  }



}









/*
=====================================
 画像読み込み
=====================================
*/


function loadImage(event){



  const file =

    event.target.files[0];






  if(!file){

    return;

  }








  if(

    !file.type.startsWith("image/")

  ){



    message.textContent =

      "画像を選んでください";



    return;


  }







  const reader =

    new FileReader();








  reader.onload = function(e){



    const image =

      new Image();







    image.onload = function(){



      loadedImage = image;






      setupCanvas();






      drawImage();






      createScratchLayer();






      /*
      画像読み込み完了後

      ここで画面切替

      */


      setGameState(

        GAME_STATE.SCRATCHING

      );






      enableScratch();






      instruction.textContent =

        "こすってみよう！";






      message.textContent = "";



    };








    image.onerror = function(){



      message.textContent =

        "画像を読み込めませんでした";



    };








    image.src =

      e.target.result;



  };







  reader.readAsDataURL(file);



}

/*
=====================================
 Canvas初期化
=====================================
*/


function setupCanvas(){


  imageCanvas.width =
    canvasSize;


  imageCanvas.height =
    canvasSize;



  scratchCanvas.width =
    canvasSize;


  scratchCanvas.height =
    canvasSize;



}









/*
=====================================
 元画像描画
=====================================
*/


function drawImage(){



  imageContext.clearRect(

    0,

    0,

    canvasSize,

    canvasSize

  );





  if(!loadedImage){

    return;

  }







  /*
    画像を正方形に収める

  */


  const scale = Math.max(

    canvasSize / loadedImage.width,

    canvasSize / loadedImage.height

  );






  const width =

    loadedImage.width * scale;





  const height =

    loadedImage.height * scale;







  const x =

    (canvasSize - width) / 2;






  const y =

    (canvasSize - height) / 2;







  imageContext.drawImage(

    loadedImage,

    x,

    y,

    width,

    height

  );



}









/*
=====================================
 銀スクラッチ作成
=====================================
*/


function createScratchLayer(){



  scratchContext.clearRect(

    0,

    0,

    canvasSize,

    canvasSize

  );







  /*
    銀色グラデーション

  */


  const gradient =

    scratchContext.createLinearGradient(

      0,

      0,

      canvasSize,

      canvasSize

    );







  gradient.addColorStop(

    0,

    "#eeeeee"

  );





  gradient.addColorStop(

    0.45,

    "#bdbdbd"

  );





  gradient.addColorStop(

    0.7,

    "#f8f8f8"

  );





  gradient.addColorStop(

    1,

    "#aaaaaa"

  );







  scratchContext.fillStyle =

    gradient;






  scratchContext.fillRect(

    0,

    0,

    canvasSize,

    canvasSize

  );








  /*
    銀の光沢表現

  */


  scratchContext.globalAlpha =

    0.2;






  scratchContext.fillStyle =

    "#ffffff";






  for(

    let i = 0;

    i < 30;

    i++

  ){



    scratchContext.fillRect(

      Math.random() * canvasSize,

      Math.random() * canvasSize,

      80,

      5

    );


  }






  scratchContext.globalAlpha =

    1;



}









/*
=====================================
 スクラッチ操作有効化
=====================================
*/


function enableScratch(){



  if(scratchEnabled){

    return;

  }





  scratchEnabled = true;






  scratchCanvas.addEventListener(

    "pointerdown",

    startScratch

  );






  scratchCanvas.addEventListener(

    "pointermove",

    moveScratch

  );






  scratchCanvas.addEventListener(

    "pointerup",

    endScratch

  );






  scratchCanvas.addEventListener(

    "pointerleave",

    endScratch

  );



}









/*
=====================================
 削り開始
=====================================
*/


function startScratch(event){



  if(

    currentState !==

    GAME_STATE.SCRATCHING

  ){

    return;

  }





  isScratching = true;






  scratchCanvas.setPointerCapture(

    event.pointerId

  );






  eraseArea(event);



}









/*
=====================================
 移動中

=====================================
*/


function moveScratch(event){



  if(!isScratching){

    return;

  }





  eraseArea(event);



}









/*
=====================================
 削り終了

=====================================
*/


function endScratch(){



  if(!isScratching){

    return;

  }





  isScratching = false;






  checkScratchProgress();



}









/*
=====================================
 銀を削る処理

=====================================
*/


function eraseArea(event){



  const rect =

    scratchCanvas

      .getBoundingClientRect();







  /*
    表示サイズとの差を補正

  */


  const x =

    (

      event.clientX -

      rect.left

    )

    *

    canvasSize /

    rect.width;







  const y =

    (

      event.clientY -

      rect.top

    )

    *

    canvasSize /

    rect.height;









  scratchContext.save();







  /*
    削った部分を透明化

  */


  scratchContext.globalCompositeOperation =

    "destination-out";







  scratchContext.beginPath();






  scratchContext.arc(

    x,

    y,

    brushSize / 2,

    0,

    Math.PI * 2

  );






  scratchContext.fill();






  scratchContext.restore();





}

/*
=====================================
 削れた割合チェック
=====================================
*/


function checkScratchProgress(){



  const imageData =

    scratchContext.getImageData(

      0,

      0,

      canvasSize,

      canvasSize

    );






  const pixels =

    imageData.data;






  let erasedPixels = 0;






  /*
    alpha値が0なら削れた部分

  */


  for(

    let i = 3;

    i < pixels.length;

    i += 4

  ){



    if(

      pixels[i] === 0

    ){


      erasedPixels++;


    }


  }







  const totalPixels =

    canvasSize *

    canvasSize;






  const progress =

    erasedPixels /

    totalPixels;







  console.log(

    "削除率:",

    Math.floor(progress * 100)

    + "%"

  );







  if(

    progress >= completeRate

  ){



    completeGame();



  }



}









/*
=====================================
 完成処理
=====================================
*/


function completeGame(){



  if(

    currentState ===

    GAME_STATE.COMPLETE

  ){

    return;

  }







  setGameState(

    GAME_STATE.COMPLETE

  );







  instruction.textContent =

    "じゃーん！";







  message.textContent =

    "すごいね！🎉";








  /*
    銀部分を自然に消す

  */


  scratchCanvas.style.transition =

    "opacity 1.2s ease";






  scratchCanvas.style.opacity =

    "0";



}









/*
=====================================
 もういちど遊ぶ

=====================================
*/


function restartGame(){



  if(!loadedImage){

    return;

  }







  /*
    銀レイヤー復活

  */


  scratchCanvas.style.transition =

    "none";






  scratchCanvas.style.opacity =

    "1";








  createScratchLayer();







  setGameState(

    GAME_STATE.SCRATCHING

  );







  instruction.textContent =

    "もういちど こすってみよう！";







  message.textContent =

    "";



}









/*
=====================================
 写真を選びなおす

 初期状態へ戻る

=====================================
*/


function resetGame(){



  loadedImage = null;



  isScratching = false;







  /*
    Canvasクリア

  */


  imageContext.clearRect(

    0,

    0,

    canvasSize,

    canvasSize

  );






  scratchContext.clearRect(

    0,

    0,

    canvasSize,

    canvasSize

  );








  /*
    ファイル選択リセット

  */


  imageInput.value = "";









  /*
    見た目リセット

  */


  scratchCanvas.style.opacity =

    "1";





  scratchCanvas.style.transition =

    "none";








  setGameState(

    GAME_STATE.BEFORE_UPLOAD

  );



}
