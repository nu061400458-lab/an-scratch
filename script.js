/*
=====================================
 スクラッチゲーム

 script.js

 1/3

 ・状態管理
 ・DOM取得
 ・イベント設定
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


const cameraInput =
  document.getElementById("cameraInput");


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
 Canvas取得
=====================================
*/


const imageContext =
  imageCanvas.getContext("2d");


const scratchContext =
  scratchCanvas.getContext("2d");








/*
=====================================
 ゲーム状態

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
 データ

=====================================
*/


let loadedImage = null;


let isScratching = false;


let scratchEnabled = false;







const canvasSize = 500;



/*
 幼児向けブラシサイズ

 50px程度が最も扱いやすい

*/

const brushSize = 55;





/*
 70%削れたら完成

*/

const completeRate = 0.7;









/*
=====================================
 初期化
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



cameraInput.addEventListener(

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
 状態変更

=====================================
*/


function setGameState(state){



  currentState = state;






  if(
    state === GAME_STATE.BEFORE_UPLOAD
  ){



    uploadArea.hidden = false;



    gameArea.hidden = true;



    resetButton.hidden = true;



    resetUploadButton.hidden = true;



    instruction.textContent = "";



    message.textContent = "";



  }







  if(
    state === GAME_STATE.SCRATCHING
  ){



    uploadArea.hidden = true;



    gameArea.hidden = false;



    resetButton.hidden = true;



    resetUploadButton.hidden = false;



  }







  if(
    state === GAME_STATE.COMPLETE
  ){



    uploadArea.hidden = true;



    gameArea.hidden = false;



    resetButton.hidden = false;



    resetUploadButton.hidden = false;



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






      /*
      Canvas準備

      */

      setupCanvas();






      /*
      画像描画

      */

      drawImage();






      /*
      銀作成

      */

      createScratchLayer();






      /*
      重要

      画像読み込み完了後に表示

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
 Canvas設定

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
 画像描画

 画像を正方形内にフィット

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








  const scale = Math.max(

    canvasSize / loadedImage.width,

    canvasSize / loadedImage.height

  );







  const drawWidth =

    loadedImage.width * scale;





  const drawHeight =

    loadedImage.height * scale;







  const x =

    (canvasSize - drawWidth) / 2;





  const y =

    (canvasSize - drawHeight) / 2;







  imageContext.drawImage(

    loadedImage,

    x,

    y,

    drawWidth,

    drawHeight

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

    "#f5f5f5"

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
    銀の光沢

  */


  scratchContext.globalAlpha =

    0.25;





  scratchContext.fillStyle =

    "#ffffff";







  for(

    let i = 0;

    i < 25;

    i++

  ){



    scratchContext.fillRect(

      Math.random() * canvasSize,

      Math.random() * canvasSize,

      100,

      4

    );



  }






  scratchContext.globalAlpha =

    1;





}









/*
=====================================
 スクラッチ操作登録

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
 終了

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
 削る処理

=====================================
*/


function eraseArea(event){



  const rect =

    scratchCanvas.getBoundingClientRect();








  /*
    表示サイズとCanvasサイズの差を補正

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
    描いた場所を透明化

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
 スクラッチ進行確認

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
    alpha値0の場所を数える

    透明 = 削った部分

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

 同じ画像で再挑戦

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
    Canvas削除

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
    ファイル入力解除

  */


  imageInput.value = "";



  cameraInput.value = "";









  /*
    スタイルリセット

  */


  scratchCanvas.style.opacity =

    "1";




  scratchCanvas.style.transition =

    "none";









  setGameState(

    GAME_STATE.BEFORE_UPLOAD

  );



}
