/********** 靶子随机运动 **********/

// 获取靶子 canvas 元素
const gameCanvas = document.getElementById("gameCanvas");

// 设定运动参数
const amplitudeX = 200;  // 水平方向最大偏移（像素）
const amplitudeY = 150;  // 垂直方向最大偏移（像素）
const transitionDuration = 6000; // 每次随机移动过渡时间（毫秒）

// 用于平滑随机运动的变量
let startOffsetX = 0, startOffsetY = 0;
let currentOffsetX = 0, currentOffsetY = 0;
let targetOffsetX = (Math.random() * 2 - 1) * amplitudeX;
let targetOffsetY = (Math.random() * 2 - 1) * amplitudeY;
let lastUpdateTime = performance.now();

// 靶子持续运动动画函数
function animateTarget() {
  if (!movementPaused) {
    const now = performance.now();
    const elapsed = now - lastUpdateTime;
    let t = elapsed / transitionDuration;
    if (t >= 1) {
      // 达到目标偏移，更新起始偏移，选取新的目标偏移
      startOffsetX = targetOffsetX;
      startOffsetY = targetOffsetY;
      currentOffsetX = targetOffsetX;
      currentOffsetY = targetOffsetY;
      lastUpdateTime = now;
      targetOffsetX = (Math.random() * 2 - 1) * amplitudeX;
      targetOffsetY = (Math.random() * 2 - 1) * amplitudeY;
      t = 0;
    } else {
      currentOffsetX = startOffsetX + t * (targetOffsetX - startOffsetX);
      currentOffsetY = startOffsetY + t * (targetOffsetY - startOffsetY);
    }
    // 目标的新位置：视口中心加上当前偏移
    const newLeft = window.innerWidth / 2 + currentOffsetX;
    const newTop = window.innerHeight / 2 + currentOffsetY;
    gameCanvas.style.left = newLeft + "px";
    gameCanvas.style.top = newTop + "px";
  }
  requestAnimationFrame(animateTarget);
}

let movementPaused = false;
animateTarget();

/********** 射箭小游戏 与 历史 Slide **********/

// 定义历史事件 slides（最后一页为邀请）
const slides = [
  {
    title: "Humble Beginnings",
    text: "Roving Archers started as a small gathering in Arroyo Park in the early 1900s.",
    image: "event1.jpg"
  },
  {
    title: "The Golden Era",
    text: "The park blossomed into a vibrant community hub with lively tournaments.",
    image: "event2.jpg"
  },
  {
    title: "A Cultural Icon",
    text: "Over decades, the archery field became a symbol of local heritage and pride.",
    image: "event3.jpg"
  },
  {
    title: "Modern Revival",
    text: "Today, tradition meets innovation as the park hosts modern events.",
    image: "event4.jpg"
  },
  {
    title: "Are You Ready to Visit?",
    text: "Experience the legacy of Arroyo Park. Reserve your spot and be part of the tradition!",
    image: "event5.jpg",
    final: true
  }
];

let currentSlideIndex = 0;
const slideContainer = document.getElementById("slideContainer");
const slideTitle = document.getElementById("slideTitle");
const slideText = document.getElementById("slideText");
const slideImage = document.getElementById("slideImage");
const reserveBtn = document.getElementById("reserveBtn");

// “Aim better!” 提示元素
const aimMessage = document.getElementById("aimMessage");

// 获取 canvas 上下文，用于绘制靶子和箭矢
const ctx = gameCanvas.getContext("2d");

// 绘制靶子：在 canvas 内绘制4个同心圆环和蓝色 bullseye（半径固定15像素）
function drawTarget() {
  ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  const rings = 4; // 4 个环
  const outerRadius = gameCanvas.width / 2 - 10;
  for (let i = 1; i <= rings; i++) {
    const r = outerRadius * (i / rings);
    ctx.beginPath();
    ctx.arc(gameCanvas.width / 2, gameCanvas.height / 2, r, 0, 2 * Math.PI);
    ctx.fillStyle = (i % 2 === 0) ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.stroke();
  }
  // 绘制 bullseye（蓝色），半径固定15像素
  ctx.beginPath();
  ctx.arc(gameCanvas.width / 2, gameCanvas.height / 2, 15, 0, 2 * Math.PI);
  ctx.fillStyle = "#0000FF";
  ctx.fill();
}

drawTarget();

let animationFrameId = null;
let arrowInMotion = false;

// 箭矢射击动画：从 canvas 底部正中发射到点击位置（以 canvas 内坐标计算）
function shootArrow(targetX, targetY) {
  if (arrowInMotion) return;
  arrowInMotion = true;
  movementPaused = true; // 射箭时暂停靶子运动
  
  const startX = gameCanvas.width / 2;
  const startY = gameCanvas.height;
  const duration = 1500; // 动画时长（毫秒）
  const startTime = performance.now();
  
  function animateArrow(currentTime) {
    const elapsed = currentTime - startTime;
    let t = elapsed / duration;
    if (t > 1) t = 1;
    
    const easeOut = 1 - Math.pow(1 - t, 3);
    let currentX = startX + (targetX - startX) * easeOut;
    let currentY = startY + (targetY - startY) * easeOut;
    
    const arcHeight = -150;
    currentY += arcHeight * Math.sin(Math.PI * easeOut);
    
    drawTarget();
    
    ctx.save();
    ctx.translate(currentX, currentY);
    const angle = Math.atan2(currentY - startY, currentX - startX);
    ctx.rotate(angle);
    // 绘制箭身
    ctx.beginPath();
    ctx.moveTo(-20, -2);
    ctx.lineTo(0, -2);
    ctx.lineTo(0, 2);
    ctx.lineTo(-20, 2);
    ctx.closePath();
    ctx.fillStyle = "#ff6f61";
    ctx.fill();
    // 绘制箭头
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(10, 0);
    ctx.lineTo(0, 4);
    ctx.fill();
    ctx.restore();
    
    if (t < 1) {
      animationFrameId = requestAnimationFrame(animateArrow);
    } else {
      arrowInMotion = false;
      movementPaused = false; // 恢复靶子运动
      
      // 检查箭矢是否命中 bullseye（canvas中心与箭矢落点的距离小于等于15像素）
      const dx = currentX - gameCanvas.width / 2;
      const dy = currentY - gameCanvas.height / 2;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= 15) {
        showSlide();
      } else {
        showAimMessage();
      }
    }
  }
  
  requestAnimationFrame(animateArrow);
}

// 显示当前历史 Slide
function showSlide() {
  if (currentSlideIndex >= slides.length) return;
  const slide = slides[currentSlideIndex];
  slideTitle.textContent = slide.title;
  slideText.textContent = slide.text;
  slideImage.src = slide.image;
  if (slide.final) {
    reserveBtn.classList.remove("hidden");
  } else {
    reserveBtn.classList.add("hidden");
  }
  slideContainer.classList.remove("hidden");
  setTimeout(() => {
    slideContainer.classList.add("show");
  }, 50);
}

// 隐藏 Slide 并准备下一次射击
function hideSlide() {
  slideContainer.classList.remove("show");
  setTimeout(() => {
    slideContainer.classList.add("hidden");
    currentSlideIndex++;
    drawTarget();
  }, 500);
}

// 显示“Aim better!”提示，持续一段时间后自动消失
function showAimMessage() {
  aimMessage.style.display = "block";
  setTimeout(() => {
    aimMessage.classList.add("show");
  }, 50);
  setTimeout(() => {
    aimMessage.classList.remove("show");
    setTimeout(() => {
      aimMessage.style.display = "none";
      drawTarget();
    }, 300);
  }, 1500);
}

// 当 Slide 显示时，点击任何位置隐藏 Slide
slideContainer.addEventListener("click", hideSlide);

// 靶子 canvas 点击事件：若 Slide 正在显示则先隐藏，否则触发射箭动画
gameCanvas.addEventListener("click", (event) => {
  if (!slideContainer.classList.contains("hidden")) {
    hideSlide();
    return;
  }
  if (arrowInMotion) return;
  const rect = gameCanvas.getBoundingClientRect();
  const targetX = event.clientX - rect.left;
  const targetY = event.clientY - rect.top;
  shootArrow(targetX, targetY);
});