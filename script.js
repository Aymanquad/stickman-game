let ninjasound = {
  push : new Howl({
    src: ['/sounds/ninja-soundtrack.wav'],
    loop: true ,
    volume : 0.17,
  })
}


var walkingsound = {
  push : new Howl({
    src: ['/sounds/footsteps.mp3']
  })
}

var fallingsound = {
  push : new Howl({
    src: ['/sounds/childs-scream-1.wav']
  })
}
  
let fallingSoundPlayed = false;

let currentCapColor = "red";




// // Function to handle touch events for stretching the stick
// function handleTouchEvents() {
//   const gameCanvas = document.getElementById('game');
  
//   // Event listener for touch start
//   gameCanvas.addEventListener('touchstart', function(event) {
//       event.preventDefault();
//       if (gameStarted && isTouchDevice()) {
//           startStretch(event.touches[0].clientX, event.touches[0].clientY);
//       }
//   });

//   // Event listener for touch end
//   gameCanvas.addEventListener('touchend', function(event) {
//       event.preventDefault();
//       if (gameStarted && isTouchDevice()) {
//           endStretch();
//       }
//   });

//   // Event listener for touch move (optional if you want to handle stretching while moving)
//   gameCanvas.addEventListener('touchmove', function(event) {
//       event.preventDefault();
//       if (gameStarted && isTouchDevice()) {
//           moveStretch(event.touches[0].clientX, event.touches[0].clientY);
//       }
//   });
// }



// Get the highscore value from local storage, or default to 0 if it doesn't exist
let highscore = localStorage.getItem('highscore') || 0;

// Display the highscore
document.getElementById('highscore-value').textContent = highscore;

// Update the highscore if the current score is higher
function updateHighscore(score) {
    if (score > highscore) {
        highscore = score;
        localStorage.setItem('highscore', highscore);
        document.getElementById('highscore-value').textContent = highscore;
    }
}

// Function to reset the highscore
function resetHighscore() {
    highscore = 0;
    localStorage.setItem('highscore', highscore);
    document.getElementById('highscore-value').textContent = highscore;
}


Array.prototype.last = function () {
    return this[this.length - 1];
  };
  
  // A sinus func acceps degrees instead of radians
  Math.sinus = function (degree) {
    return Math.sin((degree / 180) * Math.PI);
  };
  
  // Game data
  let phase = "waiting"; // waiting | stretching | turning | walking | transitioning | falling
  let lastTimestamp; // The timestamp of the previous requestAnimationFrame cycle
  
  let heroX;                        // Changes when moving forward
  let heroY;                        // Only changes when falling
  let sceneOffset;                  // Moves the whole game screen
  
  let platforms = [];
  let sticks = [];
  let trees = [];
  
  
  let score = 0;
  
  const canvasWidth = 375;
  const canvasHeight = 375;
  const platformHeight = 100;
  const heroDistanceFromEdge = 10;       //  waiting
  const paddingX = 100;                 
  const perfectAreaSize = 10;
  
  const backgroundSpeedMultiplier = 0.2;
  
  const hill1BaseHeight = 100;
  const hill1Amplitude = 10;
  const hill1Stretch = 1;
  const hill2BaseHeight = 70;
  const hill2Amplitude = 20;
  const hill2Stretch = 0.5;
  
  const stretchingSpeed = 4; // Milliseconds it takes to draw a pixel
  const turningSpeed = 4; // Milliseconds it takes to turn a degree
  const walkingSpeed = 4;
  const transitioningSpeed = 2;
  const fallingSpeed = 2;
  
  const heroWidth = 17; // 24
  const heroHeight = 30; // 40
  
  const canvas = document.getElementById("game");
  canvas.width = window.innerWidth; // Make the Canvas full screen
  canvas.height = window.innerHeight;
  
  const ctx = canvas.getContext("2d");

  function drawRedCap(ctx) {
    // Red cap
    ctx.fillStyle = "red";
    ctx.fillRect(-heroWidth / 2 - 1, -12, heroWidth + 2, 4.5);
    ctx.beginPath();
    ctx.moveTo(-9, -14.5);
    ctx.lineTo(-17, -18.5);
    ctx.lineTo(-14, -8.5);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-10, -10.5);
    ctx.lineTo(-15, -3.5);
    ctx.lineTo(-5, -7);
    ctx.fill();
}

function drawBlueCap(ctx) {
    // Blue cap
    ctx.fillStyle = "blue";
    ctx.fillRect(-heroWidth / 2 - 1, -12, heroWidth + 2, 4.5);
    ctx.beginPath();
    ctx.moveTo(-9, -14.5);
    ctx.lineTo(-17, -18.5);
    ctx.lineTo(-14, -8.5);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-10, -10.5);
    ctx.lineTo(-15, -3.5);
    ctx.lineTo(-5, -7);
    ctx.fill();
}

    

  
  const introductionElement = document.getElementById("introduction");
  const perfectElement = document.getElementById("perfect");
  const restartButton = document.getElementById("restart");
  const startButton = document.getElementById("start");
  const scoreElement = document.getElementById("score");

  let isNightMode = false;
  let isSpringMode = false;
  let isOceanMode = false;



  document.addEventListener("DOMContentLoaded", function () {
    const themeSelect = document.getElementById("theme");

    themeSelect.addEventListener("change", function () {
        const selectedTheme = themeSelect.value;
        if (selectedTheme === "night") {
            enableNightMode();
        } else {
            disableNightMode();
        }
    });
});
document.addEventListener("DOMContentLoaded", function () {
  const themeSelect = document.getElementById("theme");

  themeSelect.addEventListener("change", function () {
      const selectedTheme = themeSelect.value;
      if (selectedTheme === "spring") {
          enableSpringMode();
      } else {
          disableSpringMode();
      }
  });
});
document.addEventListener("DOMContentLoaded", function () {
  const themeSelect = document.getElementById("theme");

  themeSelect.addEventListener("change", function () {
      const selectedTheme = themeSelect.value;
      if (selectedTheme === "ocean") {
          enableOceanMode();
      } else {
          disableOceanMode();
      }
  });
});

  
  // Initialize layout
  resetGame();
  
  // Resets game variables and layouts but does not start the game (game starts on keypress)
  function resetGame() {

    fallingSoundPlayed = false;

    const themeSelect = document.getElementById("theme");
    const capSelect = document.getElementById("cap-select");

    updateHighscore(score);

    // Reset game progress
    startFlag = false;

    themeSelect.disabled = false;
    capSelect.disabled = false;
 
    phase = "waiting";
    lastTimestamp = undefined;
    sceneOffset = 0;
    score = 0;
  
    introductionElement.style.opacity = 1;
    perfectElement.style.opacity = 0;
    restartButton.style.display = "none";
    startButton.style.display = "block";
    scoreElement.innerText = score;
  
    // The first platform is always the same
    // x + w has to match paddingX
    platforms = [{ x: 50, w: 50 }];
    generatePlatform();
    generatePlatform();
    generatePlatform();
    generatePlatform();
  
    sticks = [{ x: platforms[0].x + platforms[0].w, length: 0, rotation: 0 }];
  
    trees = [];
    //10 trees at any instance r present
    generateTree();
    generateTree();
    generateTree();
    generateTree();
    generateTree();
    generateTree();
    generateTree();
    generateTree();
    generateTree();
    generateTree();
  
    heroX = platforms[0].x + platforms[0].w - heroDistanceFromEdge;
    heroY = 0;


  
    draw(ctx);
  }
  
  function generateTree() {
    const minimumGap = 30;
    const maximumGap = 150;
  
    // X coordinate of the right edge of the furthest tree
    const lastTree = trees[trees.length - 1];
    let furthestX = lastTree ? lastTree.x : 0;
  
    const x =
      furthestX +
      minimumGap +
      Math.floor(Math.random() * (maximumGap - minimumGap));
  
    const treeColors = ["#6D8821", "#8FAC34", "#98B333"];
    const color = treeColors[Math.floor(Math.random() * 3)];
  
    trees.push({ x, color });
  }
  
  function generatePlatform() {
    const minimumGap = 40;
    const maximumGap = 200;
    const minimumWidth = 20;
    const maximumWidth = 100;
  
    // X coordinate of the right edge of the furthest platform
    const lastPlatform = platforms[platforms.length - 1];
    let furthestX = lastPlatform.x + lastPlatform.w;
  
    const x =
      furthestX +
      minimumGap +
      Math.floor(Math.random() * (maximumGap - minimumGap));
    const w =
      minimumWidth + Math.floor(Math.random() * (maximumWidth - minimumWidth));
  
    platforms.push({ x, w });
  }
  


  resetGame();
  


document.addEventListener("DOMContentLoaded", function () {
  const themeSelect = document.getElementById("theme");
  const capSelect = document.getElementById("cap-select");
  const startButton = document.getElementById("start");

  startButton.addEventListener("click", function () {
      themeSelect.disabled = true;
      capSelect.disabled = true;

      startFlag = true;

      ninjasound.push.play();

  });
});



  // If space was pressed restart the game
  window.addEventListener("keydown", function (event) {
    if (event.key == " ") {
      if (!startFlag) return;
      event.preventDefault();
      resetGame();
      return;
    }
  });
  
  window.addEventListener("mousedown", function (event) {
    if (phase == "waiting") {
      if (!startFlag) return;
      lastTimestamp = undefined;
      phase = "stretching";
      window.requestAnimationFrame(animate);
    }
  });
  
  window.addEventListener("mouseup", function (event) {
    if (phase == "stretching") {
      if (!startFlag) return;
      introductionElement.style.opacity = 0;
      phase = "turning";
    }
  });
  
  window.addEventListener("resize", function (event) {
    if (!startFlag) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw(ctx);
  });

  window.addEventListener("touchstart", function (event) {
    if (phase == "waiting") {
      if (!startFlag) return;
      lastTimestamp = undefined;
      phase = "stretching";
      window.requestAnimationFrame(animate);
    }
});

window.addEventListener("touchend", function (event) {
    if (phase == "stretching") {
      if (!startFlag) return;
      introductionElement.style.opacity = 0;
      phase = "turning";
    }
});

  
  window.requestAnimationFrame(animate);
  let walkingSoundPlayed = false;
  
  // The main game loop
  function animate(timestamp) {

    if (!lastTimestamp) {
      lastTimestamp = timestamp;
      window.requestAnimationFrame(animate);
      return;
    }
  
    switch (phase) {
      case "waiting":
        return; // Stop the loop
      case "stretching": {
        if (!startFlag) return;
        sticks.last().length += (timestamp - lastTimestamp) / stretchingSpeed;
        break;
      }
      case "turning": {
        sticks.last().rotation += (timestamp - lastTimestamp) / turningSpeed;
  
        if (sticks.last().rotation > 90) {
          sticks.last().rotation = 90;
  
          const [nextPlatform, perfectHit] = thePlatformTheStickHits();
          if (nextPlatform) {
            // Increase score
            score += perfectHit ? 2 : 1;
            scoreElement.innerText = score;
  
            if (perfectHit) {
              perfectElement.style.opacity = 1;
              setTimeout(() => (perfectElement.style.opacity = 0), 1000);
            }
  
            generatePlatform();
            generateTree();
            generateTree();
          }
  
          phase = "walking";
        }
        break;
      }
      
      case "walking": {
        

        if (!walkingSoundPlayed) {
          walkingsound.push.play();
          console.log("walking sound played !");
          walkingSoundPlayed = true; // Set the flag to true to indicate that the sound has been played
        }

        heroX += (timestamp - lastTimestamp) / walkingSpeed;
  
        const [nextPlatform] = thePlatformTheStickHits();
        if (nextPlatform) {
          // If hero will reach another platform then limit it's position at it's edge
          const maxHeroX = nextPlatform.x + nextPlatform.w - heroDistanceFromEdge;
          if (heroX > maxHeroX) {
            heroX = maxHeroX;

            walkingsound.push.stop()
            console.log("walking sound stopped");
            walkingSoundPlayed = false;

            phase = "transitioning";
          }
        } else {
          // If hero won't reach another platform then limit it's position at the end of the pole
          const maxHeroX = sticks.last().x + sticks.last().length + heroWidth;
          if (heroX > maxHeroX) {

            walkingsound.push.stop()
            console.log("walking sound stopped");
            walkingSoundPlayed = false;

            heroX = maxHeroX;
            phase = "falling";
          }
        }
        break;
      }
      case "transitioning": {
        sceneOffset += (timestamp - lastTimestamp) / transitioningSpeed;
  
        const [nextPlatform] = thePlatformTheStickHits();
        if (sceneOffset > nextPlatform.x + nextPlatform.w - paddingX) {
          // Add the next step
          sticks.push({
            x: nextPlatform.x + nextPlatform.w,
            length: 0,
            rotation: 0
          });
          phase = "waiting";
        }
        break;
      }
      case "falling": {

        ninjasound.push.stop();

        if (!fallingSoundPlayed) {
          fallingsound.push.play();
          console.log("falling sound played !");
          fallingSoundPlayed = true; // Set the flag to true to indicate that the sound has been played
        }

        if (sticks.last().rotation < 180)
          sticks.last().rotation += (timestamp - lastTimestamp) / turningSpeed;
  
        heroY += (timestamp - lastTimestamp) / fallingSpeed;
        const maxHeroY =
          platformHeight + 100 + (window.innerHeight - canvasHeight) / 2;
        if (heroY > maxHeroY) {
          restartButton.style.display = "block";
          return;
        }
        break;
      }
      default:
        throw Error("Wrong phase");
    }
  
    draw(ctx);
    window.requestAnimationFrame(animate);
  
    lastTimestamp = timestamp;
  }
  
  // Returns the platform the stick hit (if it didn't hit any stick then return undefined)
  function thePlatformTheStickHits() {
    if (sticks.last().rotation != 90)
      throw Error(`Stick is ${sticks.last().rotation}°`);
    const stickFarX = sticks.last().x + sticks.last().length;
  
    const platformTheStickHits = platforms.find(
      (platform) => platform.x < stickFarX && stickFarX < platform.x + platform.w
    );
  
    // If the stick hits the perfect area
    if (
      (platformTheStickHits) &&
      (platformTheStickHits.x + platformTheStickHits.w / 2 - perfectAreaSize / 2 <stickFarX) &&
      (stickFarX < platformTheStickHits.x + platformTheStickHits.w / 2 + perfectAreaSize / 2)
    )
      return [platformTheStickHits, true];
  
    return [platformTheStickHits, false];
  }
  
  function draw(ctx) {
    ctx.save();
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  
    drawBackground();
  
    // Center main canvas area to the middle of the screen
    ctx.translate(
      (window.innerWidth - canvasWidth) / 2 - sceneOffset,
      (window.innerHeight - canvasHeight) / 2
    );
  
    // Draw scene
    drawPlatforms();
    drawHero(ctx);
    drawSticks();
  
    // Restore transformation
    ctx.restore();
  }
  
  restartButton.addEventListener("click", function (event) {
    event.preventDefault();
    resetGame();
    restartButton.style.display = "none";
  });
  
  startButton.addEventListener("click", function (event) {
    event.preventDefault();
    startGame()
    startButton.style.display = "none";

    ninjasound.push.play();
    console.log("bg music is played !");

  });

  function drawPlatforms() {
    platforms.forEach(({ x, w }) => {
      // Draw platform
      ctx.fillStyle = "black";
      ctx.fillRect(
        x,
        canvasHeight - platformHeight,
        w,
        platformHeight + (window.innerHeight - canvasHeight) / 2
      );
  
      // Draw perfect area only if hero did not yet reach the platform
      if (sticks.last().x < x) {
        ctx.fillStyle = "red";
        ctx.fillRect(
          x + w / 2 - perfectAreaSize / 2,
          canvasHeight - platformHeight,
          perfectAreaSize,
          perfectAreaSize
        );
      }
    });
  }

 
  function drawHero(ctx) {
    ctx.save();
    ctx.fillStyle = "black";
    ctx.translate(
        heroX - heroWidth / 2,
        heroY + canvasHeight - platformHeight - heroHeight / 2
    );

    // Body
    drawRoundedRect(
        -heroWidth / 2,
        -heroHeight / 2,
        heroWidth,
        heroHeight - 4,
        5
    );

    // Legs
    const legDistance = 5;
    ctx.beginPath();
    ctx.arc(legDistance, 11.5, 3, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-legDistance, 11.5, 3, 0, Math.PI * 2, false);
    ctx.fill();

    // Eye
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(5, -7, 3, 0, Math.PI * 2, false);
    ctx.fill();


    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the hero with the current cap color
    switch (currentCapColor) {
        case "red":
            drawRedCap(ctx);
            break;
        case "blue":
            drawBlueCap(ctx);
            break;
        case "green":
            drawGreenCap(ctx);
            break;
        default:
            // Default cap color
            drawRedCap(ctx);
            break;
    }

    

  
  //drawBlueCap(ctx);

  ctx.restore();
}

function updateHeroCap(ctx, selectedCap) {
    // Clear previous cap
    ctx.clearRect(
        -heroWidth / 2 - 1,
        -12,
        heroWidth + 2,
        4.5
    );

    // Draw new cap based on selected option
    switch (selectedCap) {
        case "red":
            drawRedCap(ctx);
            break;
        case "blue":
            drawBlueCap(ctx);
            break;
        default:
            // Do nothing for no cap option
            break;
    }
}

  
  function drawRoundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.lineTo(x, y + height - radius);
    ctx.arcTo(x, y + height, x + radius, y + height, radius);
    ctx.lineTo(x + width - radius, y + height);
    ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
    ctx.lineTo(x + width, y + radius);
    ctx.arcTo(x + width, y, x + width - radius, y, radius);
    ctx.lineTo(x + radius, y);
    ctx.arcTo(x, y, x, y + radius, radius);
    ctx.fill();
    
  }
  
  function drawSticks() {
    sticks.forEach((stick) => {
      ctx.save();
  
      // Move the anchor point to the start of the stick and rotate
      ctx.translate(stick.x, canvasHeight - platformHeight);
      ctx.rotate((Math.PI / 180) * stick.rotation);
  
      // Draw stick
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -stick.length);
      ctx.stroke();
  
      // Restore transformations
      ctx.restore();
    });
  }
  
  function drawBackground() {
    if (isNightMode) {
        // Night mode colors
        ctx.fillStyle = "#07224B"; // Dark blue sky
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

        // Draw moon
        drawMoon();

        // Dark green hills
        drawHill(hill1BaseHeight, hill1Amplitude, hill1Stretch, "#004225");
        drawHill(hill2BaseHeight, hill2Amplitude, hill2Stretch, "#00381C");

        // Darker trees
        trees.forEach((tree) => drawTree(tree.x, "#3D4826"));
    } else if (isSpringMode) {
        // Spring mode colors
        ctx.fillStyle = "#BEE7FD"; // Light blue sky with a tint of yellow
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

        // Pink trees
        trees.forEach((tree) => drawTree(tree.x, "#FFC0CB"));

        // Yellowish-orange hills
        drawHill(hill1BaseHeight, hill1Amplitude, hill1Stretch, "#FFD700");
        drawHill(hill2BaseHeight, hill2Amplitude, hill2Stretch, "#FFA500");

        // Pink leaves dropping from sky
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            drawLeaf(x, y);
        }
    } else if (isOceanMode) {
        // Ocean mode colors
        const skyColor = "#87CEEB"; // Light blue sky
        const plateauColor = ["#4682B4", "#4169E1", "#6495ED"]; // Shades of blue for plateau
        const sunColor = "#FFA500"; // Orange sun color
        const oceanColor = "#1E90FF"; // Deep blue ocean color

        // Draw sky
        ctx.fillStyle = skyColor;
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

        drawHill(hill1BaseHeight, hill1Amplitude, hill1Stretch, "#4169E1");
        drawHill(hill2BaseHeight, hill2Amplitude, hill2Stretch, "#6495ED");

        // Draw sun
        drawSun();

    } else {
        // Day mode colors
        var gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
        gradient.addColorStop(0, "#BBD691"); // Light blue sky
        gradient.addColorStop(1, "#FEF1E1"); // Light orange horizon
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

        // Green hills
        drawHill(hill1BaseHeight, hill1Amplitude, hill1Stretch, "#95C629");
        drawHill(hill2BaseHeight, hill2Amplitude, hill2Stretch, "#659F1C");

        // Normal trees
        trees.forEach((tree) => drawTree(tree.x, tree.color));
    }
}



function drawRedCap(ctx) {
  // Red cap
  ctx.fillStyle = "red";
  ctx.fillRect(-heroWidth / 2 - 1, -12, heroWidth + 2, 4.5);
  ctx.beginPath();
  ctx.moveTo(-9, -14.5);
  ctx.lineTo(-17, -18.5);
  ctx.lineTo(-14, -8.5);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-10, -10.5);
  ctx.lineTo(-15, -3.5);
  ctx.lineTo(-5, -7);
  ctx.fill();

  
}

function drawBlueCap(ctx) {
  // Blue cap
  ctx.fillStyle = "blue";
  ctx.fillRect(-heroWidth / 2 - 1, -12, heroWidth + 2, 4.5);
  ctx.beginPath();
  ctx.moveTo(-9, -14.5);
  ctx.lineTo(-17, -18.5);
  ctx.lineTo(-14, -8.5);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-10, -10.5);
  ctx.lineTo(-15, -3.5);
  ctx.lineTo(-5, -7);
  ctx.fill();
}

function drawGreenCap(ctx) {
  // Green cap
  ctx.fillStyle = "green";
  ctx.fillRect(-heroWidth / 2 - 1, -12, heroWidth + 2, 4.5);
  ctx.beginPath();
  ctx.moveTo(-9, -14.5);
  ctx.lineTo(-17, -18.5);
  ctx.lineTo(-14, -8.5);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-10, -10.5);
  ctx.lineTo(-15, -3.5);
  ctx.lineTo(-5, -7);
  ctx.fill();
}




document.addEventListener("DOMContentLoaded", function() {
  const capSelect = document.getElementById("cap-select");
  const redCapButton = document.getElementById("red-cap-button");
  const blueCapButton = document.getElementById("blue-cap-button");
  const greenCapButton = document.getElementById("green-cap-button");

  // Function to change cap color
  function changeCapColor(color) {
    currentCapColor = color;
    const ctx = canvas.getContext("2d");

    

    // Draw new cap based on selected color
    switch (color) {
      case "red":
        drawRedCap(ctx);
        console.log("color changed to red !");
        break;
      case "blue":
        drawBlueCap(ctx);
        console.log("color changed to blue !");
        break;
      case "green":
        drawGreenCap(ctx);
        console.log("color changed to green !");

        break;
      default:
        // Do nothing for unknown color
        break;
    }

    ctx.save();
    ctx.restore();
    //drawHero(ctx);
    
  }


  // Event listeners for cap select dropdown and buttons
  capSelect.addEventListener("change", function(event) {
    const selectedColor = event.target.value;
    changeCapColor(selectedColor);
  });

});




// Function to draw a leaf
function drawLeaf(x, y) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x - 10, y + 10, x - 20, y);
    ctx.quadraticCurveTo(x - 10, y - 10, x, y);
    ctx.fillStyle = "#FFC0CB"; // Pink color
    ctx.fill();
}


function drawSun() {
  ctx.save();
  ctx.beginPath();
  ctx.arc(150, 200, 30, 0, Math.PI * 2);
  ctx.fillStyle = "#FFC100"; // Light gray moon
  ctx.shadowColor = "#FF6500"; // Moon shadow color
  ctx.shadowBlur = 20; // Moon shadow blur
  ctx.fill();
  ctx.restore();
}
  
  // A hill is a shape under a stretched out sinus wave
  function drawHill(baseHeight, amplitude, stretch, color) {
    ctx.beginPath();
    ctx.moveTo(0, window.innerHeight);
    ctx.lineTo(0, getHillY(0, baseHeight, amplitude, stretch));
    for (let i = 0; i < window.innerWidth; i++) {
      ctx.lineTo(i, getHillY(i, baseHeight, amplitude, stretch));
    }
    ctx.lineTo(window.innerWidth, window.innerHeight);
    ctx.fillStyle = color;
    ctx.fill();
  }
  
  function drawTree(x, color) {
    ctx.save();
    ctx.translate(
      (-sceneOffset * backgroundSpeedMultiplier + x) * hill1Stretch,
      getTreeY(x, hill1BaseHeight, hill1Amplitude)
    );
  
    const treeTrunkHeight = 5;
    const treeTrunkWidth = 2;
    const treeCrownHeight = 25;
    const treeCrownWidth = 10;
  
    // Draw trunk
    ctx.fillStyle = "#7D833C";
    ctx.fillRect(
      -treeTrunkWidth / 2,
      -treeTrunkHeight,
      treeTrunkWidth,
      treeTrunkHeight
    );
  
    // Draw crown
    ctx.beginPath();
    ctx.moveTo(-treeCrownWidth / 2, -treeTrunkHeight);
    ctx.lineTo(0, -(treeTrunkHeight + treeCrownHeight));
    ctx.lineTo(treeCrownWidth / 2, -treeTrunkHeight);
    ctx.fillStyle = color;
    ctx.fill();
  
    ctx.restore();
  }
  
  function getHillY(windowX, baseHeight, amplitude, stretch) {
    const sineBaseY = window.innerHeight - baseHeight;
    return (
      Math.sinus((sceneOffset * backgroundSpeedMultiplier + windowX) * stretch) *
        amplitude +
      sineBaseY
    );
  }
  
  function getTreeY(x, baseHeight, amplitude) {
    const sineBaseY = window.innerHeight - baseHeight;
    return Math.sinus(x) * amplitude + sineBaseY;
  }



function startGame() {
    lastTimestamp = undefined;
    introductionElement.style.opacity = 0;
    phase = "waiting";
    window.requestAnimationFrame(animate);
}
function drawMoon() {
  ctx.save();
  ctx.beginPath();
  ctx.arc(150, 200, 30, 0, Math.PI * 2);
  ctx.fillStyle = "#EAEAEA"; // Light gray moon
  ctx.shadowColor = "#EAEAEA"; // Moon shadow color
  ctx.shadowBlur = 20; // Moon shadow blur
  ctx.fill();
  ctx.restore();
}

function enableNightMode() {
  isNightMode = true;
  draw(ctx);
}

function disableNightMode() {
  isNightMode = false;
  draw(ctx);
}

function enableSpringMode() {
  isSpringMode = true;
  draw(ctx);
}

function disableSpringMode() {
  isSpringMode = false;
  draw(ctx);
}
function enableOceanMode() {
  isOceanMode = true;
  draw(ctx);
}

function disableOceanMode() {
  isOceanMode = false;
  draw(ctx);
}







  