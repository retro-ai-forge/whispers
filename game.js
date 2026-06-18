// Game state
let gameData = [];
let currentStep = 1;
let sanity = 100;
let visitedSteps = new Set();

// DOM elements
const elements = {
  sanityValue: null,
  sanityBar: null,
  sanityStatus: null,
  pixelArt: null,
  artDescription: null,
  chapterTitle: null,
  storyText: null,
  choicesContainer: null,
  restartBtn: null,
  header: null
};

// Initialize game
async function init() {
  // Get DOM elements
  elements.sanityValue = document.getElementById('sanity-value');
  elements.sanityBar = document.getElementById('sanity-bar');
  elements.sanityStatus = document.getElementById('sanity-status');
  elements.pixelArt = document.getElementById('pixel-art');
  elements.artDescription = document.getElementById('art-description');
  elements.chapterTitle = document.getElementById('chapter-title');
  elements.storyText = document.getElementById('story-text');
  elements.choicesContainer = document.getElementById('choices-container');
  elements.restartBtn = document.getElementById('restart-btn');
  elements.header = document.querySelector('header');

  // Load game data
  try {
    const response = await fetch('game-data.json');
    gameData = await response.json();
    
    // Initialize sanity display
    updateSanityDisplay();
    
    // Start game
    loadStep(currentStep);
    
    // Setup restart button
    elements.restartBtn.addEventListener('click', restartGame);
  } catch (error) {
    console.error('Failed to load game data:', error);
    elements.storyText.textContent = 'Error loading game. Please refresh the page.';
  }
}

// Load a story step
function loadStep(stepNumber) {
  const step = gameData.find(s => s.step === stepNumber);
  
  if (!step) {
    console.error('Step not found:', stepNumber);
    return;
  }

  currentStep = stepNumber;
  visitedSteps.add(stepNumber);

  // Show/hide header based on step
  if (stepNumber === 1) {
    elements.header.classList.remove('hidden');
  } else {
    elements.header.classList.add('hidden');
  }

  // Update UI
  elements.chapterTitle.textContent = step.title;
  elements.storyText.textContent = step.description;
  elements.artDescription.textContent = step.pixelArtPrompt;
  
  // Generate pixel art representation
  generatePixelArt(step);
  
  // Clear previous choices
  elements.choicesContainer.innerHTML = '';
  
  // Check if this is an ending
  if (step.isEnding) {
    showEnding(step);
  } else {
    // Add choices
    step.choices.forEach((choice, index) => {
      const button = createChoiceButton(choice, index);
      elements.choicesContainer.appendChild(button);
    });
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Create a choice button
function createChoiceButton(choice, index) {
  const button = document.createElement('button');
  button.className = 'choice-btn';
  button.setAttribute('data-step', choice.nextStep);
  button.setAttribute('data-cost', choice.sanityCost);
  
  const choiceText = document.createElement('span');
  choiceText.className = 'choice-text';
  choiceText.textContent = choice.text;
  
  const costText = document.createElement('span');
  costText.className = choice.sanityCost >= 20 ? 'choice-cost high-cost' : 'choice-cost';
  costText.textContent = `Sanity cost: -${choice.sanityCost}`;
  
  button.appendChild(choiceText);
  button.appendChild(costText);
  
  button.addEventListener('click', () => makeChoice(choice));
  
  return button;
}

// Handle choice selection
function makeChoice(choice) {
  // Reduce sanity
  sanity = Math.max(0, sanity - choice.sanityCost);
  updateSanityDisplay();
  
  // Add visual feedback
  const buttons = elements.choicesContainer.querySelectorAll('.choice-btn');
  buttons.forEach(btn => btn.style.opacity = '0.5');
  
  // Delay before loading next step
  setTimeout(() => {
    // Check if sanity dropped to 0
    if (sanity <= 0) {
      loadStep(20); // Madness ending
    } else {
      loadStep(choice.nextStep);
    }
  }, 600);
}

// Update sanity display
function updateSanityDisplay() {
  elements.sanityValue.textContent = sanity;
  elements.sanityBar.style.height = sanity + '%';
  
  // Update status text
  let status = '';
  if (sanity >= 80) {
    status = 'Rational';
    elements.sanityBar.className = 'sanity-bar-inner';
  } else if (sanity >= 60) {
    status = 'Unsettled';
    elements.sanityBar.className = 'sanity-bar-inner';
  } else if (sanity >= 40) {
    status = 'Disturbed';
    elements.sanityBar.className = 'sanity-bar-inner sanity-low';
  } else if (sanity >= 20) {
    status = 'Terrified';
    elements.sanityBar.className = 'sanity-bar-inner sanity-low';
  } else if (sanity > 0) {
    status = 'Breaking';
    elements.sanityBar.className = 'sanity-bar-inner sanity-critical';
  } else {
    status = 'Shattered';
    elements.sanityBar.className = 'sanity-bar-inner sanity-critical';
  }
  
  elements.sanityStatus.textContent = status;
}

// Generate pixel art representation
function generatePixelArt(step) {
  // Clear previous content
  elements.pixelArt.innerHTML = '';
  
  // Create canvas (landscape format)
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  
  // Dark background
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, 256, 160);
  
  // Scene-specific pixel art
  switch(step.step) {
    case 1: // Arrival - foggy dock
      drawFoggyDock(ctx);
      break;
    case 2: // Strange Greeting - old woman
      drawOldWoman(ctx);
      break;
    case 3: // Fogbound Alley
      drawAlley(ctx);
      break;
    case 4: // Town Square
      drawTownSquare(ctx);
      break;
    case 5: // Ambush - tentacle creature
      drawCreature(ctx);
      break;
    case 9: // Vision from Beyond
      drawCosmicVision(ctx);
      break;
    case 6: // Priest's Warning
      drawPriest(ctx);
      break;
    case 7: // Statue's Secret
      drawStatue(ctx);
      break;
    case 8: // Shadows Moving
      drawNightShadows(ctx);
      break;
    case 10: // Inn
      drawInn(ctx);
      break;
    case 11: // Masks
      drawMasks(ctx);
      break;
    case 14: // Procession
      drawProcession(ctx);
      break;
    case 15: // Storm
      drawStorm(ctx);
      break;
    case 17: // Caves
      drawCaves(ctx);
      break;
    case 18: // The Summoning
      drawSummoning(ctx);
      break;
    case 19: // Desperate Escape
      drawDesperation(ctx);
      break;
    case 20: // Madness ending
      drawMadness(ctx);
      break;
    case 21: // Escape ending
      drawEscape(ctx);
      break;
    case 42: // Guardian ending
      drawGuardian(ctx);
      break;
    case 43: // Transcendence ending
      drawTranscendence(ctx);
      break;
    default:
      // Generic scene with atmospheric fog
      drawGenericScene(ctx, step.step);
  }
  
  elements.pixelArt.appendChild(canvas);
}

// Scene drawing functions - High quality landscape versions
function drawFoggyDock(ctx) {
  // Dark sky with gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 80);
  skyGrad.addColorStop(0, '#0a0a1a');
  skyGrad.addColorStop(1, '#1a1a2a');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 256, 80);
  
  // Sea in background
  ctx.fillStyle = '#0a1a2a';
  ctx.fillRect(0, 60, 256, 30);
  
  // Dock planks (perspective)
  ctx.fillStyle = '#3a2a1a';
  for (let i = 0; i < 256; i += 10) {
    const width = 8 + (i / 256) * 4;
    ctx.fillRect(i, 90, width, 70);
    // Dark gaps between planks
    ctx.fillStyle = '#1a1a0a';
    ctx.fillRect(i + width, 90, 2, 70);
    ctx.fillStyle = '#3a2a1a';
  }
  
  // Dock posts
  ctx.fillStyle = '#2a1a0a';
  ctx.fillRect(40, 70, 8, 90);
  ctx.fillRect(120, 65, 8, 95);
  ctx.fillRect(200, 68, 8, 92);
  
  // Multiple lanterns with glow
  const lanterns = [[50, 45], [130, 40], [210, 43]];
  lanterns.forEach(([x, y]) => {
    // Lantern pole
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(x, y, 4, 25);
    // Lantern body
    ctx.fillStyle = '#6a4a2a';
    ctx.fillRect(x - 4, y - 8, 12, 12);
    // Light glow
    ctx.fillStyle = '#faaa2a';
    ctx.globalAlpha = 0.6;
    ctx.fillRect(x - 8, y - 12, 20, 20);
    ctx.globalAlpha = 0.3;
    ctx.fillRect(x - 12, y - 16, 28, 28);
    ctx.globalAlpha = 1;
    // Bright center
    ctx.fillStyle = '#ffcc4a';
    ctx.fillRect(x - 2, y - 6, 8, 8);
  });
  
  // Shadowy figures (cultists)
  const figures = [
    [25, 65, 18, 35], [65, 70, 16, 32], [95, 68, 20, 38],
    [145, 72, 17, 34], [180, 66, 19, 36], [215, 69, 18, 35]
  ];
  figures.forEach(([x, y, w, h]) => {
    // Body
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(x, y, w, h);
    // Head
    ctx.fillRect(x + w/4, y - 8, w/2, 10);
    // Robes darker at bottom
    ctx.fillStyle = '#050508';
    ctx.fillRect(x, y + h - 10, w, 10);
  });
  
  // Dense fog layers
  for (let i = 0; i < 160; i += 3) {
    ctx.fillStyle = '#2a3a3a';
    ctx.globalAlpha = 0.05 + Math.sin(i * 0.1) * 0.03;
    ctx.fillRect(0, i, 256, 2);
  }
  ctx.globalAlpha = 1;
  
  // Foreground fog
  ctx.fillStyle = '#3a4a4a';
  ctx.globalAlpha = 0.4;
  ctx.fillRect(0, 100, 256, 20);
  ctx.fillRect(0, 130, 256, 15);
  ctx.globalAlpha = 1;
}

function drawOldWoman(ctx) {
  // Dark foggy background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 160);
  bgGrad.addColorStop(0, '#1a1a2a');
  bgGrad.addColorStop(1, '#0a0a1a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 256, 160);
  
  // Crowd silhouettes in background
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = '#0a0a1a';
    ctx.globalAlpha = 0.6;
    const x = i * 25 + Math.random() * 10;
    const h = 40 + Math.random() * 15;
    ctx.fillRect(x, 160 - h, 12, h);
    ctx.globalAlpha = 1;
  }
  
  // Old woman - larger, more detailed
  const womanX = 90;
  const womanY = 45;
  
  // Dark cloak/robe
  ctx.fillStyle = '#1a1a2a';
  ctx.fillRect(womanX - 25, womanY + 20, 80, 95);
  // Tattered edges
  for (let i = 0; i < 8; i++) {
    ctx.fillRect(womanX - 25 + i * 10, womanY + 110, 8, 5 + Math.random() * 8);
  }
  
  // Hood
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(womanX - 5, womanY - 5, 40, 30);
  
  // Withered face (parchment-like)
  ctx.fillStyle = '#6a5a4a';
  ctx.fillRect(womanX, womanY, 30, 28);
  // Face shadows/wrinkles
  ctx.fillStyle = '#4a3a2a';
  ctx.fillRect(womanX + 2, womanY + 8, 26, 2);
  ctx.fillRect(womanX + 3, womanY + 14, 24, 2);
  ctx.fillRect(womanX + 2, womanY + 20, 26, 2);
  
  // Hollow, glassy eyes
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(womanX + 6, womanY + 10, 7, 7);
  ctx.fillRect(womanX + 18, womanY + 10, 7, 7);
  // Eerie glow in eyes
  ctx.fillStyle = '#4a6a4a';
  ctx.globalAlpha = 0.7;
  ctx.fillRect(womanX + 7, womanY + 11, 5, 5);
  ctx.fillRect(womanX + 19, womanY + 11, 5, 5);
  ctx.globalAlpha = 0.3;
  ctx.fillRect(womanX + 4, womanY + 8, 11, 11);
  ctx.fillRect(womanX + 16, womanY + 8, 11, 11);
  ctx.globalAlpha = 1;
  
  // Mouth with filed teeth
  ctx.fillStyle = '#1a0a0a';
  ctx.fillRect(womanX + 8, womanY + 22, 14, 4);
  // Pointed teeth
  ctx.fillStyle = '#8a8a8a';
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(womanX + 9 + i * 3, womanY + 23, 2, 3);
  }
  
  // Reaching/pointing hand with webbed fingers
  ctx.fillStyle = '#5a4a3a';
  ctx.fillRect(womanX + 35, womanY + 35, 30, 8);
  // Fingers
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(womanX + 60 + i * 5, womanY + 30 + i * 2, 12, 4);
    // Webbing hint
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(womanX + 62 + i * 5, womanY + 32 + i * 2, 8, 2);
    ctx.fillStyle = '#5a4a3a';
  }
  
  // Fog wisps
  ctx.fillStyle = '#3a4a4a';
  ctx.globalAlpha = 0.3;
  ctx.fillRect(0, 50, 256, 15);
  ctx.fillRect(0, 90, 256, 20);
  ctx.globalAlpha = 1;
}

function drawAlley(ctx) {
  // Perspective alley walls
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, 256, 160);
  
  // Left wall with perspective
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(60, 40);
  ctx.lineTo(60, 160);
  ctx.lineTo(0, 160);
  ctx.fill();
  
  // Right wall with perspective
  ctx.beginPath();
  ctx.moveTo(256, 0);
  ctx.lineTo(196, 40);
  ctx.lineTo(196, 160);
  ctx.lineTo(256, 160);
  ctx.fill();
  
  // Sagging buildings details
  ctx.fillStyle = '#2a2a2a';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(10 + i * 12, 20 + i * 5, 8, 60);
    ctx.fillRect(200 + i * 10, 25 + i * 4, 8, 55);
  }
  
  // Wet cobblestone ground with perspective
  for (let y = 100; y < 160; y += 6) {
    const rowWidth = 60 + (y - 100) * 2;
    const startX = (256 - rowWidth) / 2;
    for (let x = 0; x < rowWidth; x += 8) {
      ctx.fillStyle = (x + y) % 16 === 0 ? '#2a2a2a' : '#1a1a1a';
      ctx.fillRect(startX + x, y, 7, 5);
      // Wet reflection
      if (Math.random() > 0.7) {
        ctx.fillStyle = '#3a3a4a';
        ctx.globalAlpha = 0.3;
        ctx.fillRect(startX + x, y, 7, 2);
        ctx.globalAlpha = 1;
      }
    }
  }
  
  // Thick, unnatural fog layers
  ctx.fillStyle = '#2a3a3a';
  ctx.globalAlpha = 0.5;
  ctx.fillRect(0, 30, 256, 25);
  ctx.globalAlpha = 0.6;
  ctx.fillRect(0, 65, 256, 30);
  ctx.globalAlpha = 0.4;
  ctx.fillRect(0, 110, 256, 20);
  ctx.globalAlpha = 1;
  
  // Distant flickering light
  ctx.fillStyle = '#6a4a2a';
  ctx.globalAlpha = 0.4;
  ctx.fillRect(110, 50, 36, 25);
  ctx.globalAlpha = 0.2;
  ctx.fillRect(95, 45, 66, 35);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#8a6a2a';
  ctx.fillRect(122, 58, 12, 10);
  
  // Something slithering - tentacle shadow
  ctx.fillStyle = '#0a1a0a';
  ctx.globalAlpha = 0.7;
  // Thick tentacle
  ctx.fillRect(170, 130, 12, 30);
  ctx.fillRect(175, 125, 18, 10);
  // Sucker details
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = '#1a2a1a';
    ctx.fillRect(173 + i * 3, 135 + i * 6, 4, 4);
  }
  ctx.globalAlpha = 1;
  
  // More tentacle writhing in background
  ctx.fillStyle = '#0a2a1a';
  ctx.globalAlpha = 0.4;
  ctx.fillRect(80, 90, 8, 25);
  ctx.fillRect(200, 85, 10, 30);
  ctx.globalAlpha = 1;
}

function drawTownSquare(ctx) {
  // Ominous sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 70);
  skyGrad.addColorStop(0, '#1a1a2a');
  skyGrad.addColorStop(1, '#2a2a3a');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 256, 70);
  
  // Ground - cobblestone plaza
  const groundGrad = ctx.createLinearGradient(0, 70, 0, 160);
  groundGrad.addColorStop(0, '#3a3a3a');
  groundGrad.addColorStop(1, '#2a2a2a');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, 70, 256, 90);
  
  // Cobblestone pattern
  for (let y = 70; y < 160; y += 8) {
    for (let x = 0; x < 256; x += 8) {
      if ((x + y) % 16 === 0) {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(x, y, 7, 7);
      }
    }
  }
  
  // Empty market stalls (abandoned)
  const stalls = [[15, 90], [220, 92], [180, 88]];
  stalls.forEach(([x, y]) => {
    // Stall structure
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(x, y, 28, 35);
    // Awning
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(x - 4, y - 8, 36, 10);
    // Empty shelves
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(x + 2, y + 10, 24, 2);
    ctx.fillRect(x + 2, y + 20, 24, 2);
  });
  
  // Central statue with wrong proportions
  const statueX = 110;
  const statueY = 35;
  
  // Pedestal
  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(statueX - 15, statueY + 50, 60, 25);
  
  // Main body (too long, wrong proportions)
  ctx.fillStyle = '#5a5a5a';
  ctx.fillRect(statueX, statueY, 30, 65);
  
  // Head (wrong shape)
  ctx.fillStyle = '#6a6a6a';
  ctx.fillRect(statueX + 5, statueY - 15, 20, 20);
  // Too many eyes
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(statueX + 8, statueY - 10, 4, 4);
  ctx.fillRect(statueX + 16, statueY - 10, 4, 4);
  ctx.fillRect(statueX + 12, statueY - 6, 4, 4);
  
  // Arms at wrong angles
  ctx.fillStyle = '#5a5a5a';
  ctx.fillRect(statueX - 12, statueY + 15, 15, 6);
  ctx.fillRect(statueX + 27, statueY + 20, 18, 6);
  
  // Extra limbs (disturbing)
  ctx.fillRect(statueX - 8, statueY + 35, 12, 5);
  ctx.fillRect(statueX + 26, statueY + 40, 14, 5);
  ctx.fillRect(statueX + 8, statueY + 50, 6, 20);
  
  // Statue seems to shudder - add motion blur effect
  ctx.fillStyle = '#4a4a4a';
  ctx.globalAlpha = 0.2;
  ctx.fillRect(statueX - 2, statueY - 15, 34, 80);
  ctx.fillRect(statueX + 2, statueY - 15, 26, 80);
  ctx.globalAlpha = 1;
  
  // Grinning priest in corner
  const priestX = 200;
  const priestY = 95;
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(priestX, priestY, 20, 45);
  // Head
  ctx.fillStyle = '#5a4a3a';
  ctx.fillRect(priestX + 4, priestY - 8, 12, 12);
  // Wide grin (unsettling)
  ctx.fillStyle = '#1a0a0a';
  ctx.fillRect(priestX + 5, priestY - 2, 10, 3);
  // Eyes
  ctx.fillStyle = '#8a8a8a';
  ctx.fillRect(priestX + 6, priestY - 6, 3, 2);
  ctx.fillRect(priestX + 11, priestY - 6, 3, 2);
  // Waving arm
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(priestX + 18, priestY + 10, 12, 5);
  ctx.fillRect(priestX + 26, priestY + 5, 6, 8);
}

function drawCreature(ctx) {
  // Dark alley background
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, 256, 160);
  
  // Alley walls
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, 50, 160);
  ctx.fillRect(206, 0, 50, 160);
  
  // Gutter where it emerges
  ctx.fillStyle = '#050505';
  ctx.fillRect(180, 120, 40, 40);
  
  // Fetid water spray
  ctx.fillStyle = '#1a2a1a';
  ctx.globalAlpha = 0.4;
  for (let i = 0; i < 8; i++) {
    ctx.fillRect(160 + i * 8, 100 - i * 5, 6, 8);
  }
  ctx.globalAlpha = 1;
  
  // Creature's main body (glistening, writhing mass)
  const creatureX = 140;
  const creatureY = 60;
  
  // Central mass
  ctx.fillStyle = '#2a3a2a';
  ctx.fillRect(creatureX, creatureY, 50, 60);
  ctx.fillStyle = '#3a4a3a';
  ctx.fillRect(creatureX + 5, creatureY + 5, 40, 50);
  
  // Glistening highlights
  ctx.fillStyle = '#4a6a4a';
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 6; i++) {
    ctx.fillRect(creatureX + 10 + i * 6, creatureY + 8 + i * 8, 8, 6);
  }
  ctx.globalAlpha = 1;
  
  // Many writhing tentacles
  ctx.fillStyle = '#1a2a1a';
  const tentacles = [
    [creatureX + 25, creatureY + 30, -45, -25, 8],
    [creatureX + 25, creatureY + 30, 35, -30, 10],
    [creatureX + 25, creatureY + 30, -30, 20, 7],
    [creatureX + 25, creatureY + 30, 45, 15, 9],
    [creatureX + 25, creatureY + 30, 0, -40, 6],
    [creatureX + 25, creatureY + 30, -15, 35, 8],
    [creatureX + 25, creatureY + 30, 20, 40, 7],
    [creatureX + 25, creatureY + 30, -50, 10, 9]
  ];
  
  tentacles.forEach(([startX, startY, dx, dy, width]) => {
    for (let t = 0; t <= 1; t += 0.08) {
      const x = startX + dx * t;
      const y = startY + dy * t + Math.sin(t * 6) * 4;
      const w = width * (1 - t * 0.5);
      ctx.fillRect(x, y, w, w);
      
      // Suckers on tentacles
      if (t > 0.2 && t % 0.25 < 0.1) {
        ctx.fillStyle = '#2a3a2a';
        ctx.fillRect(x + w/4, y + w/4, w/2, w/2);
        ctx.fillStyle = '#1a2a1a';
      }
    }
  });
  
  // Rusted fishhook claws
  ctx.strokeStyle = '#6a3a2a';
  ctx.lineWidth = 2;
  const claws = [[creatureX + 10, creatureY + 20], [creatureX + 40, creatureY + 25], [creatureX + 25, creatureY + 10]];
  claws.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 8, y - 12);
    ctx.lineTo(x - 6, y - 8);
    ctx.stroke();
  });
  
  // Multiple eyes (wrong number, wrong placement)
  const eyes = [
    [creatureX + 15, creatureY + 25],
    [creatureX + 28, creatureY + 22],
    [creatureX + 38, creatureY + 28],
    [creatureX + 22, creatureY + 35],
    [creatureX + 35, creatureY + 38],
    [creatureX + 18, creatureY + 45]
  ];
  
  eyes.forEach(([x, y]) => {
    // Eye socket
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(x, y, 8, 8);
    // Red glowing iris
    ctx.fillStyle = '#8a1a1a';
    ctx.fillRect(x + 2, y + 2, 4, 4);
    // Glow
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#aa2a2a';
    ctx.fillRect(x - 1, y - 1, 10, 10);
    ctx.globalAlpha = 1;
  });
  
  // Protagonist recoiling
  ctx.fillStyle = '#3a3a4a';
  ctx.fillRect(40, 90, 25, 50);
  ctx.fillRect(45, 82, 15, 12);
  // Arm raised defensively
  ctx.fillRect(30, 95, 15, 8);
  ctx.fillRect(20, 88, 12, 10);
}

function drawCosmicVision(ctx) {
  // Reality tearing - swirling cosmos
  for (let i = 0; i < 256; i += 3) {
    for (let j = 0; j < 160; j += 3) {
      const centerX = 128;
      const centerY = 80;
      const dist = Math.sqrt((i - centerX) * (i - centerX) + (j - centerY) * (j - centerY));
      const angle = Math.atan2(j - centerY, i - centerX);
      const spiral = angle + dist * 0.05;
      const wave = Math.sin(dist * 0.08 + spiral * 2) * 60;
      const wave2 = Math.cos(spiral * 3) * 40;
      
      const r = Math.max(0, Math.min(255, 30 + wave + wave2));
      const g = Math.max(0, Math.min(255, 20 + wave * 0.5));
      const b = Math.max(0, Math.min(255, 60 + wave + wave2 * 0.7));
      
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(i, j, 3, 3);
    }
  }
  
  // Impossible geometry that violates Euclidean space
  ctx.strokeStyle = '#8a6aaa';
  ctx.lineWidth = 2;
  
  // Non-Euclidean pentagon
  ctx.beginPath();
  for (let i = 0; i < 7; i++) {
    const angle = (i / 6) * Math.PI * 2 + Math.PI / 3;
    const radius = 50 + Math.sin(i) * 10;
    const x = 128 + Math.cos(angle) * radius;
    const y = 80 + Math.sin(angle) * (radius * 0.7);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  
  // Inner impossible shape
  ctx.strokeStyle = '#6a4a8a';
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i / 7) * Math.PI * 2;
    const x = 128 + Math.cos(angle) * 25 + Math.sin(angle * 3) * 8;
    const y = 80 + Math.sin(angle) * 25 + Math.cos(angle * 3) * 8;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  
  // Alien shapes stirring beneath the sea (bottom third)
  ctx.fillStyle = '#0a1a2a';
  ctx.globalAlpha = 0.6;
  ctx.fillRect(0, 110, 256, 50);
  ctx.globalAlpha = 1;
  
  // Vast shapes in the deep
  ctx.fillStyle = '#1a2a3a';
  ctx.globalAlpha = 0.8;
  // Massive tentacles
  for (let i = 0; i < 5; i++) {
    const x = 20 + i * 50;
    const curve = Math.sin(i * 0.8) * 15;
    ctx.fillRect(x + curve, 120, 35, 40);
    ctx.fillRect(x + 5 + curve, 115, 25, 10);
  }
  ctx.globalAlpha = 1;
  
  // Cosmic void eyes watching
  const voidEyes = [[40, 40], [216, 45], [128, 25]];
  voidEyes.forEach(([x, y]) => {
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, 14, 14);
    ctx.fillStyle = '#8a3aaa';
    ctx.globalAlpha = 0.7;
    ctx.fillRect(x + 3, y + 3, 8, 8);
    ctx.globalAlpha = 0.3;
    ctx.fillRect(x - 3, y - 3, 20, 20);
    ctx.globalAlpha = 1;
  });
}

function drawSummoning(ctx) {
  // Stormy, wrong-colored sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 70);
  skyGrad.addColorStop(0, '#1a0a2a');
  skyGrad.addColorStop(0.5, '#2a1a3a');
  skyGrad.addColorStop(1, '#1a1a2a');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 256, 70);
  
  // Lightning - wrong colors
  ctx.strokeStyle = '#8a4aaa';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(60, 0);
  ctx.lineTo(55, 25);
  ctx.lineTo(62, 25);
  ctx.lineTo(50, 50);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(200, 0);
  ctx.lineTo(195, 30);
  ctx.lineTo(202, 30);
  ctx.lineTo(190, 60);
  ctx.stroke();
  
  // Churning, boiling ocean
  const seaGrad = ctx.createLinearGradient(0, 70, 0, 160);
  seaGrad.addColorStop(0, '#1a2a3a');
  seaGrad.addColorStop(1, '#0a1a2a');
  ctx.fillStyle = seaGrad;
  ctx.fillRect(0, 70, 256, 90);
  
  // Violent waves
  ctx.fillStyle = '#2a3a4a';
  for (let i = 0; i < 256; i += 20) {
    const height = 10 + Math.sin(i * 0.1) * 8;
    ctx.fillRect(i, 70 - height/2, 18, height);
  }
  
  // Bubbles from deep ocean trenches
  ctx.fillStyle = '#3a4a5a';
  ctx.globalAlpha = 0.6;
  for (let i = 0; i < 12; i++) {
    const x = Math.random() * 256;
    const y = 80 + Math.random() * 40;
    const size = 4 + Math.random() * 6;
    ctx.fillRect(x, y, size, size);
  }
  ctx.globalAlpha = 1;
  
  // Lighthouse on cliff
  const lighthouseX = 200;
  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(lighthouseX, 20, 18, 55);
  ctx.fillRect(lighthouseX + 3, 15, 12, 8);
  
  // Otherworldly beacon (impossible colors)
  ctx.fillStyle = '#8a4aaa';
  ctx.globalAlpha = 0.5;
  ctx.fillRect(lighthouseX - 30, 10, 80, 30);
  ctx.globalAlpha = 0.3;
  ctx.fillRect(lighthouseX - 50, 5, 120, 40);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#aa6acc';
  ctx.fillRect(lighthouseX + 5, 16, 8, 6);
  
  // Lighthouse pulses in rhythm
  ctx.fillStyle = '#6a3a8a';
  ctx.globalAlpha = 0.4;
  ctx.fillRect(lighthouseX - 10, 15, 40, 15);
  ctx.globalAlpha = 1;
  
  // MASSIVE tentacle breaking the surface
  const tentX = 80;
  const tentY = 75;
  
  // Main tentacle shaft
  ctx.fillStyle = '#2a4a3a';
  for (let i = 0; i < 85; i += 3) {
    const width = 35 - (i * 0.15);
    const x = tentX + Math.sin(i * 0.1) * 8;
    ctx.fillRect(x, tentY + i, width, 3);
  }
  
  // Barnacles and ancient textures
  ctx.fillStyle = '#3a5a4a';
  for (let i = 0; i < 20; i++) {
    const x = tentX + Math.random() * 30;
    const y = tentY + 10 + Math.random() * 70;
    ctx.fillRect(x, y, 4, 4);
  }
  
  // Suckers
  ctx.fillStyle = '#1a3a2a';
  for (let i = 0; i < 12; i++) {
    const x = tentX + 5 + i * 6;
    const y = tentY + 20 + i * 5 + Math.sin(i) * 8;
    ctx.fillRect(x, y, 6, 6);
    ctx.fillStyle = '#0a2a1a';
    ctx.fillRect(x + 1, y + 1, 4, 4);
    ctx.fillStyle = '#1a3a2a';
  }
  
  // Water cascading off tentacle
  ctx.fillStyle = '#2a3a4a';
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 8; i++) {
    ctx.fillRect(tentX + 30 + i * 3, tentY + 30 + i * 8, 4, 12);
  }
  ctx.globalAlpha = 1;
  
  // Cultists at the shore - chanting
  const cultists = [[20, 110], [45, 112], [145, 108], [170, 110], [220, 109]];
  cultists.forEach(([x, y]) => {
    // Robed figure
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(x, y, 16, 50);
    // Hood
    ctx.fillRect(x + 3, y - 8, 10, 10);
    // Arms raised
    ctx.fillRect(x - 6, y + 15, 10, 6);
    ctx.fillRect(x + 12, y + 15, 10, 6);
    ctx.fillRect(x - 10, y + 10, 6, 8);
    ctx.fillRect(x + 20, y + 10, 6, 8);
  });
  
  // More tentacles in background (the entity is vast)
  ctx.fillStyle = '#1a3a2a';
  ctx.globalAlpha = 0.6;
  ctx.fillRect(10, 90, 20, 70);
  ctx.fillRect(230, 85, 22, 75);
  ctx.globalAlpha = 0.4;
  ctx.fillRect(150, 95, 18, 65);
  ctx.globalAlpha = 1;
}

function drawMadness(ctx) {
  // Void/cosmic darkness
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 256, 160);
  
  // Fractured reality - shattered like glass
  ctx.strokeStyle = '#4a1a4a';
  ctx.lineWidth = 2;
  for (let i = 0; i < 30; i++) {
    ctx.beginPath();
    const x1 = Math.random() * 256;
    const y1 = Math.random() * 160;
    const x2 = x1 + (Math.random() - 0.5) * 60;
    const y2 = y1 + (Math.random() - 0.5) * 60;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  
  // More cracks
  ctx.strokeStyle = '#6a2a6a';
  ctx.lineWidth = 1;
  for (let i = 0; i < 40; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * 256, Math.random() * 160);
    ctx.lineTo(Math.random() * 256, Math.random() * 160);
    ctx.stroke();
  }
  
  // Protagonist figure (center) - hollow, joining them
  const figX = 110;
  const figY = 60;
  
  // Body
  ctx.fillStyle = '#1a1a2a';
  ctx.fillRect(figX, figY, 36, 70);
  
  // Head
  ctx.fillStyle = '#2a2a3a';
  ctx.fillRect(figX + 8, figY - 18, 20, 22);
  
  // Hollow, glassy eyes (empty)
  ctx.fillStyle = '#6a6a6a';
  ctx.fillRect(figX + 11, figY - 12, 6, 6);
  ctx.fillRect(figX + 23, figY - 12, 6, 6);
  // Void pupils
  ctx.fillStyle = '#000000';
  ctx.fillRect(figX + 13, figY - 10, 2, 2);
  ctx.fillRect(figX + 25, figY - 10, 2, 2);
  
  // Villagers welcoming (surrounding)
  const villagers = [
    [30, 80], [60, 85], [180, 82], [210, 78]
  ];
  
  villagers.forEach(([x, y]) => {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(x, y, 18, 45);
    ctx.fillRect(x + 4, y - 8, 10, 10);
    // Reaching arms
    ctx.fillRect(x - 8, y + 20, 12, 5);
    ctx.fillRect(x + 14, y + 20, 12, 5);
  });
  
  // Cosmic void swirling
  ctx.fillStyle = '#2a1a3a';
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    const radius = 40 + i * 8;
    const x = 128 + Math.cos(angle) * radius;
    const y = 80 + Math.sin(angle) * radius * 0.7;
    ctx.fillRect(x - 10, y - 10, 20, 20);
  }
  ctx.globalAlpha = 1;
  
  // The thing beneath (barely visible, overwhelming)
  ctx.fillStyle = '#0a2a0a';
  ctx.globalAlpha = 0.5;
  ctx.fillRect(0, 120, 256, 40);
  ctx.fillStyle = '#1a3a1a';
  for (let i = 0; i < 8; i++) {
    ctx.fillRect(i * 30, 130 + Math.sin(i) * 5, 20, 30);
  }
  ctx.globalAlpha = 1;
}

function drawEscape(ctx) {
  // Dark, stormy sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 60);
  skyGrad.addColorStop(0, '#1a1a2a');
  skyGrad.addColorStop(1, '#0a0a1a');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 256, 60);
  
  // Violent, churning ocean
  const seaGrad = ctx.createLinearGradient(0, 60, 0, 160);
  seaGrad.addColorStop(0, '#1a2a3a');
  seaGrad.addColorStop(1, '#0a1a2a');
  ctx.fillStyle = seaGrad;
  ctx.fillRect(0, 60, 256, 100);
  
  // Choppy waves
  ctx.fillStyle = '#2a3a4a';
  for (let i = 0; i < 256; i += 12) {
    const height = 6 + Math.sin(i * 0.15) * 4;
    ctx.fillRect(i, 65 + Math.sin(i * 0.2) * 8, 10, height);
  }
  
  // More wave detail
  ctx.fillStyle = '#3a4a5a';
  for (let i = 0; i < 256; i += 15) {
    ctx.fillRect(i + 5, 80 + Math.cos(i * 0.15) * 6, 8, 3);
  }
  
  // Boat fleeing (right side, escaping)
  const boatX = 180;
  const boatY = 85;
  
  // Hull
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(boatX, boatY, 50, 18);
  ctx.fillRect(boatX + 5, boatY - 5, 40, 8);
  
  // Cabin
  ctx.fillStyle = '#4a3a2a';
  ctx.fillRect(boatX + 15, boatY - 12, 20, 10);
  
  // Engine wake
  ctx.fillStyle = '#4a5a6a';
  ctx.globalAlpha = 0.6;
  ctx.fillRect(boatX - 15, boatY + 10, 20, 8);
  ctx.fillRect(boatX - 25, boatY + 12, 15, 6);
  ctx.globalAlpha = 1;
  
  // Lornsmouth collapsing (left side, sinking)
  const village = [
    [15, 75, 18, 40],   // Building 1
    [38, 70, 25, 45],   // Building 2
    [68, 78, 20, 37],   // Building 3
    [92, 72, 22, 43]    // Building 4
  ];
  
  village.forEach(([x, y, w, h], i) => {
    // Buildings tilting and sinking
    const tilt = i * 2;
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x - tilt, y, w, h);
    
    // Windows (dark)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 4 - tilt, y + 8, 6, 6);
    ctx.fillRect(x + w - 10 - tilt, y + 8, 6, 6);
    ctx.fillRect(x + 4 - tilt, y + 18, 6, 6);
    
    // Water partially submerging
    ctx.fillStyle = '#0a1a2a';
    ctx.globalAlpha = 0.7;
    ctx.fillRect(x - tilt, y + h - 15, w, 15);
    ctx.globalAlpha = 1;
  });
  
  // Church steeple collapsing
  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(55, 55, 12, 25);
  ctx.fillRect(58, 50, 6, 8);
  
  // Splash and debris
  ctx.fillStyle = '#2a3a4a';
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 6; i++) {
    ctx.fillRect(10 + i * 15, 60 - i * 3, 8, 15 + i * 2);
  }
  ctx.globalAlpha = 1;
  
  // The thing thrashing in frustration (massive shadow)
  ctx.fillStyle = '#0a2a0a';
  ctx.globalAlpha = 0.6;
  ctx.fillRect(30, 105, 35, 55);
  ctx.fillRect(70, 110, 30, 50);
  ctx.fillRect(105, 108, 28, 52);
  ctx.globalAlpha = 1;
  
  // Traumatized survivor in boat (small figure)
  ctx.fillStyle = '#3a3a4a';
  ctx.fillRect(boatX + 20, boatY - 8, 10, 15);
  ctx.fillRect(boatX + 22, boatY - 14, 6, 8);
}

function drawGuardian(ctx) {
  // Dawn breaking - new beginning
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 80);
  skyGrad.addColorStop(0, '#2a2a4a');
  skyGrad.addColorStop(0.6, '#3a3a5a');
  skyGrad.addColorStop(1, '#4a4a6a');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 256, 80);
  
  // Ground
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(0, 80, 256, 80);
  
  // Massive sealed gate/portal in center
  const gateX = 90;
  const gateY = 20;
  
  // Gate structure
  ctx.fillStyle = '#3a3a5a';
  ctx.fillRect(gateX, gateY, 76, 115);
  
  // Inner portal (sealed)
  ctx.fillStyle = '#1a1a3a';
  ctx.fillRect(gateX + 10, gateY + 10, 56, 95);
  
  // Glowing binding runes
  const runes = [
    [gateX + 20, gateY + 20], [gateX + 50, gateY + 22],
    [gateX + 18, gateY + 45], [gateX + 52, gateY + 47],
    [gateX + 20, gateY + 70], [gateX + 50, gateY + 72],
    [gateX + 33, gateY + 30], [gateX + 33, gateY + 60]
  ];
  
  runes.forEach(([x, y]) => {
    ctx.fillStyle = '#6a8aaa';
    ctx.globalAlpha = 0.8;
    ctx.fillRect(x, y, 8, 8);
    ctx.fillRect(x + 2, y - 3, 4, 14);
    ctx.fillRect(x - 3, y + 2, 14, 4);
    ctx.globalAlpha = 0.4;
    ctx.fillRect(x - 5, y - 5, 18, 18);
    ctx.globalAlpha = 1;
  });
  
  // Chains of force
  ctx.strokeStyle = '#5a7a9a';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.6;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(gateX + 15, gateY + 20 + i * 15);
    ctx.lineTo(gateX + 61, gateY + 25 + i * 15);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  
  // Guardian figure (standing watch)
  const guardX = 30;
  const guardY = 85;
  
  // Body
  ctx.fillStyle = '#4a4a6a';
  ctx.fillRect(guardX, guardY, 28, 60);
  
  // Head
  ctx.fillStyle = '#5a5a7a';
  ctx.fillRect(guardX + 6, guardY - 12, 16, 16);
  
  // Eyes (watchful, eternal)
  ctx.fillStyle = '#6a8aaa';
  ctx.fillRect(guardX + 9, guardY - 8, 4, 4);
  ctx.fillRect(guardX + 17, guardY - 8, 4, 4);
  ctx.globalAlpha = 0.5;
  ctx.fillRect(guardX + 7, guardY - 10, 8, 8);
  ctx.fillRect(guardX + 15, guardY - 10, 8, 8);
  ctx.globalAlpha = 1;
  
  // Staff/weapon
  ctx.fillStyle = '#3a3a5a';
  ctx.fillRect(guardX + 25, guardY - 15, 4, 75);
  ctx.fillRect(guardX + 23, guardY - 18, 8, 6);
  
  // Lighthouse ruins in background
  ctx.fillStyle = '#2a2a3a';
  ctx.fillRect(200, 60, 20, 45);
  ctx.fillRect(205, 55, 10, 8);
  
  // Village peaceful but changed
  ctx.fillStyle = '#3a3a4a';
  ctx.fillRect(15, 110, 15, 30);
  ctx.fillRect(175, 112, 18, 28);
}

function drawPriest(ctx) {
  // Dark, oppressive atmosphere
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 160);
  bgGrad.addColorStop(0, '#1a1a2a');
  bgGrad.addColorStop(1, '#0a0a1a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 256, 160);
  
  // Church/building silhouette in background
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(10, 40, 80, 90);
  ctx.fillRect(35, 20, 30, 25);
  
  // Priest figure (close, leaning in)
  const priestX = 110;
  const priestY = 40;
  
  // Moth-eaten vestments
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(priestX, priestY + 20, 60, 100);
  
  // Tattered edges
  for (let i = 0; i < 8; i++) {
    ctx.fillRect(priestX + i * 7, priestY + 115, 5, 5 + Math.random() * 8);
  }
  
  // Hood
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(priestX + 10, priestY, 40, 30);
  
  // Face (pale, decay)
  ctx.fillStyle = '#5a5a4a';
  ctx.fillRect(priestX + 15, priestY + 10, 30, 25);
  
  // Deep-set eyes
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(priestX + 20, priestY + 16, 6, 6);
  ctx.fillRect(priestX + 34, priestY + 16, 6, 6);
  
  // Eyes darting to shadows
  ctx.fillStyle = '#4a4a4a';
  ctx.fillRect(priestX + 22, priestY + 18, 2, 2);
  ctx.fillRect(priestX + 36, priestY + 18, 2, 2);
  
  // Webbed fingers visible
  ctx.fillStyle = '#4a4a3a';
  ctx.fillRect(priestX + 50, priestY + 60, 25, 8);
  // Fingers
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(priestX + 68 + i * 5, priestY + 56 + i, 8, 4);
    // Webbing
    ctx.fillStyle = '#3a3a2a';
    ctx.fillRect(priestX + 70 + i * 5, priestY + 58 + i, 6, 2);
    ctx.fillStyle = '#4a4a3a';
  }
  
  // Blessed water vial (glowing green)
  const vialX = priestX + 70;
  const vialY = priestY + 50;
  
  ctx.fillStyle = '#3a5a3a';
  ctx.fillRect(vialX, vialY, 12, 20);
  
  // Liquid inside
  ctx.fillStyle = '#2a7a2a';
  ctx.fillRect(vialX + 2, vialY + 8, 8, 10);
  
  // Eerie glow
  ctx.fillStyle = '#4aaa4a';
  ctx.globalAlpha = 0.6;
  ctx.fillRect(vialX - 3, vialY + 5, 18, 18);
  ctx.globalAlpha = 0.3;
  ctx.fillRect(vialX - 8, vialY, 28, 28);
  ctx.globalAlpha = 1;
  
  // Hint of brine smell (visual vapor)
  ctx.fillStyle = '#2a4a4a';
  ctx.globalAlpha = 0.2;
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(priestX + 20 + i * 15, priestY + 45 - i * 8, 20, 12);
  }
  ctx.globalAlpha = 1;
}

function drawStatue(ctx) {
  // Cold, overcast sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 70);
  skyGrad.addColorStop(0, '#2a2a3a');
  skyGrad.addColorStop(1, '#1a1a2a');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 256, 70);
  
  // Frost forming in air
  ctx.fillStyle = '#4a4a5a';
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 15; i++) {
    ctx.fillRect(Math.random() * 256, Math.random() * 60, 2, 2);
  }
  ctx.globalAlpha = 1;
  
  // Ground (frosted cobblestones)
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(0, 70, 256, 90);
  
  // Pedestal with writhing carvings
  const pedX = 95;
  const pedY = 95;
  
  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(pedX, pedY, 66, 30);
  
  // Carvings that twist (shifting symbols)
  ctx.fillStyle = '#5a5a6a';
  ctx.globalAlpha = 0.7;
  for (let i = 0; i < 20; i++) {
    const x = pedX + 5 + (i % 6) * 10;
    const y = pedY + 5 + Math.floor(i / 6) * 8;
    ctx.fillRect(x + Math.sin(i) * 2, y, 6, 6);
  }
  ctx.globalAlpha = 1;
  
  // Statue with WRONG proportions
  const statX = 110;
  const statY = 25;
  
  // Main body (too long, joints wrong)
  ctx.fillStyle = '#5a5a5a';
  ctx.fillRect(statX, statY, 36, 80);
  
  // Head (not quite human)
  ctx.fillStyle = '#6a6a6a';
  ctx.fillRect(statX + 8, statY - 18, 20, 22);
  
  // Too many eyes
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(statX + 11, statY - 12, 5, 5);
  ctx.fillRect(statX + 23, statY - 12, 5, 5);
  ctx.fillRect(statX + 17, statY - 8, 4, 4);
  
  // Arms at impossible angles
  ctx.fillStyle = '#5a5a5a';
  // Left arm bent wrong
  ctx.fillRect(statX - 18, statY + 20, 20, 6);
  ctx.fillRect(statX - 22, statY + 12, 8, 12);
  // Right arm too long
  ctx.fillRect(statX + 34, statY + 25, 25, 6);
  ctx.fillRect(statX + 54, statY + 18, 8, 12);
  
  // Extra limbs (disturbing)
  ctx.fillRect(statX - 10, statY + 42, 15, 5);
  ctx.fillRect(statX + 31, statY + 48, 18, 5);
  ctx.fillRect(statX + 12, statY + 62, 7, 25);
  ctx.fillRect(statX + 22, statY + 65, 6, 22);
  
  // Motion blur (shuddering)
  ctx.fillStyle = '#4a4a4a';
  ctx.globalAlpha = 0.3;
  ctx.fillRect(statX - 3, statY - 18, 42, 90);
  ctx.globalAlpha = 0.2;
  ctx.fillRect(statX + 3, statY - 18, 30, 90);
  ctx.globalAlpha = 1;
  
  // Frost spreading from statue
  ctx.fillStyle = '#6a6a7a';
  ctx.globalAlpha = 0.4;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const len = 25 + i * 3;
    const x = statX + 18 + Math.cos(angle) * len;
    const y = statY + 40 + Math.sin(angle) * len;
    ctx.fillRect(x, y, 8, 8);
  }
  ctx.globalAlpha = 1;
}

function drawNightShadows(ctx) {
  // Unnaturally dark night
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, 256, 160);
  
  // Buildings silhouetted
  const buildings = [
    [15, 35, 40, 85],
    [70, 40, 35, 80],
    [130, 38, 38, 82],
    [190, 42, 42, 78]
  ];
  
  buildings.forEach(([x, y, w, h]) => {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(x, y, w, h);
    
    // Sickly glowing windows
    ctx.fillStyle = '#6a4a2a';
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        if (Math.random() > 0.3) {
          const winX = x + 5 + j * (w - 15);
          const winY = y + 10 + i * 20;
          ctx.fillRect(winX, winY, 8, 10);
          // Glow
          ctx.globalAlpha = 0.3;
          ctx.fillRect(winX - 2, winY - 2, 12, 14);
          ctx.globalAlpha = 1;
        }
      }
    }
  });
  
  // Doors slamming (motion blur)
  ctx.fillStyle = '#1a1a1a';
  ctx.globalAlpha = 0.5;
  ctx.fillRect(35, 90, 12, 30);
  ctx.fillRect(37, 90, 12, 30);
  ctx.fillRect(150, 95, 12, 25);
  ctx.fillRect(152, 95, 12, 25);
  ctx.globalAlpha = 1;
  
  // Unseen things shuffling - shadow creatures
  const shadows = [
    [50, 100, 18, 45],
    [90, 95, 20, 50],
    [170, 98, 16, 47],
    [210, 102, 19, 43]
  ];
  
  shadows.forEach(([x, y, w, h]) => {
    ctx.fillStyle = '#000000';
    ctx.globalAlpha = 0.9;
    ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = 0.6;
    ctx.fillRect(x - 3, y, w + 6, h);
    ctx.globalAlpha = 1;
  });
  
  // Too many eyes watching (pairs in darkness)
  const eyes = [
    [55, 110], [75, 115], [95, 108],
    [120, 105], [175, 112], [215, 108],
    [30, 85], [185, 90], [110, 95]
  ];
  
  eyes.forEach(([x, y]) => {
    // Red glowing eyes
    ctx.fillStyle = '#8a2a2a';
    ctx.fillRect(x, y, 4, 4);
    ctx.fillRect(x + 8, y, 4, 4);
    // Glow
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#aa3a3a';
    ctx.fillRect(x - 1, y - 1, 6, 6);
    ctx.fillRect(x + 7, y - 1, 6, 6);
    ctx.globalAlpha = 1;
  });
  
  // Thick darkness between buildings
  ctx.fillStyle = '#000000';
  ctx.globalAlpha = 0.7;
  ctx.fillRect(55, 60, 15, 100);
  ctx.fillRect(105, 65, 25, 95);
  ctx.fillRect(168, 70, 22, 90);
  ctx.globalAlpha = 1;
}

function drawInn(ctx) {
  // Dark interior
  ctx.fillStyle = '#1a0a0a';
  ctx.fillRect(0, 0, 256, 160);
  
  // Walls that shift (wrong angles)
  ctx.fillStyle = '#2a1a0a';
  ctx.fillRect(0, 0, 25, 160);
  ctx.fillRect(231, 0, 25, 160);
  ctx.fillRect(0, 0, 256, 30);
  
  // Crooked doorway
  ctx.beginPath();
  ctx.fillStyle = '#0a0a00';
  ctx.moveTo(20, 50);
  ctx.lineTo(12, 140);
  ctx.lineTo(35, 140);
  ctx.lineTo(28, 50);
  ctx.fill();
  
  // Innkeeper (wordless, waiting)
  const innX = 100;
  const innY = 60;
  
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(innX, innY, 45, 80);
  
  // Head
  ctx.fillStyle = '#4a3a2a';
  ctx.fillRect(innX + 10, innY - 15, 25, 20);
  
  // Empty eyes
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(innX + 14, innY - 10, 5, 5);
  ctx.fillRect(innX + 26, innY - 10, 5, 5);
  
  // Bar/counter
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(60, 130, 140, 15);
  ctx.fillRect(60, 145, 140, 5);
  
  // Candles casting shifting light
  const candles = [[75, 125], [130, 127], [180, 126]];
  candles.forEach(([x, y]) => {
    // Candle
    ctx.fillStyle = '#6a4a2a';
    ctx.fillRect(x, y, 4, 12);
    // Flame
    ctx.fillStyle = '#faaa2a';
    ctx.fillRect(x + 1, y - 5, 2, 6);
    // Glow
    ctx.globalAlpha = 0.4;
    ctx.fillRect(x - 10, y - 15, 24, 30);
    ctx.globalAlpha = 0.2;
    ctx.fillRect(x - 20, y - 25, 44, 50);
    ctx.globalAlpha = 1;
  });
  
  // Walls whispering (texture effect)
  ctx.fillStyle = '#3a2a1a';
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 15; i++) {
    ctx.fillRect(5 + Math.random() * 15, 30 + i * 9, 15, 6);
    ctx.fillRect(236 + Math.random() * 15, 30 + i * 9, 15, 6);
  }
  ctx.globalAlpha = 1;
}

function drawMasks(ctx) {
  // Dark shop interior
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, 256, 160);
  
  // Broken shelves
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(0, 35, 256, 4);
  ctx.fillRect(0, 70, 256, 4);
  ctx.fillRect(0, 105, 256, 4);
  ctx.fillRect(0, 140, 256, 4);
  
  // Support beams
  ctx.fillRect(60, 0, 4, 160);
  ctx.fillRect(130, 0, 4, 160);
  ctx.fillRect(200, 0, 4, 160);
  
  // Uncanny masks leering from shelves
  const masks = [
    // Row 1
    [15, 12], [45, 15], [80, 14], [115, 16], [150, 13], [185, 15], [220, 14],
    // Row 2
    [10, 47], [50, 48], [90, 46], [125, 49], [165, 47], [200, 48], [235, 46],
    // Row 3
    [20, 82], [60, 80], [100, 83], [140, 81], [180, 82], [215, 80],
    // Row 4
    [30, 117], [70, 115], [110, 118], [150, 116], [190, 117], [225, 115]
  ];
  
  masks.forEach(([x, y]) => {
    // Mask base
    ctx.fillStyle = '#6a5a4a';
    ctx.fillRect(x, y, 22, 18);
    
    // Disturbing features
    ctx.fillStyle = '#1a1a1a';
    // Eyes (wrong placement)
    ctx.fillRect(x + 4, y + 4, 4, 4);
    ctx.fillRect(x + 14, y + 4, 4, 4);
    
    // Sometimes third eye
    if (Math.random() > 0.7) {
      ctx.fillRect(x + 9, y + 2, 3, 3);
    }
    
    // Mouth (too wide or wrong)
    ctx.fillRect(x + 5, y + 12, 12, 3);
    
    // Sacred clay texture
    ctx.fillStyle = '#5a4a3a';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(x + 2 + Math.random() * 18, y + 2 + Math.random() * 14, 2, 2);
    }
  });
  
  // Footsteps passing outside (visible through gap)
  ctx.fillStyle = '#1a1a2a';
  ctx.globalAlpha = 0.8;
  ctx.fillRect(5, 145, 15, 15);
  ctx.fillRect(25, 148, 15, 12);
  ctx.globalAlpha = 1;
  
  // Dust motes in air
  ctx.fillStyle = '#3a3a3a';
  for (let i = 0; i < 20; i++) {
    ctx.fillRect(Math.random() * 256, Math.random() * 160, 1, 1);
  }
}

function drawProcession(ctx) {
  // Night
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, 128, 128);
  
  // Cultists in line
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(10 + i * 18, 70 - i * 5, 12, 30);
    
    // Lanterns
    if (i % 2 === 0) {
      ctx.fillStyle = '#8a6a2a';
      ctx.fillRect(12 + i * 18, 65 - i * 5, 8, 8);
    }
  }
}

function drawStorm(ctx) {
  // Violent stormy sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 80);
  skyGrad.addColorStop(0, '#0a0a1a');
  skyGrad.addColorStop(0.5, '#1a1a2a');
  skyGrad.addColorStop(1, '#2a2a3a');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 256, 80);
  
  // Thunder roaring - lightning flash
  ctx.strokeStyle = '#8a8aaa';
  ctx.lineWidth = 4;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(80, 0);
  ctx.lineTo(75, 30);
  ctx.lineTo(82, 30);
  ctx.lineTo(70, 60);
  ctx.lineTo(65, 75);
  ctx.stroke();
  ctx.globalAlpha = 1;
  
  // Another lightning bolt
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(200, 0);
  ctx.lineTo(195, 25);
  ctx.lineTo(202, 25);
  ctx.lineTo(190, 50);
  ctx.stroke();
  ctx.globalAlpha = 1;
  
  // Horizontal rain lashing
  ctx.strokeStyle = '#4a4a6a';
  ctx.lineWidth = 1;
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 160;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 10 + Math.random() * 5, y + 3);
    ctx.stroke();
  }
  
  // Churning sea
  ctx.fillStyle = '#0a1a2a';
  ctx.fillRect(0, 100, 256, 60);
  ctx.fillStyle = '#1a2a3a';
  for (let i = 0; i < 256; i += 15) {
    ctx.fillRect(i, 100 + Math.sin(i * 0.1) * 8, 12, 10);
  }
  
  // Rocky cliff
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(0, 80, 256, 25);
  ctx.fillStyle = '#1a1a1a';
  for (let i = 0; i < 10; i++) {
    ctx.fillRect(i * 25, 85 + Math.random() * 5, 20, 20);
  }
  
  // Lighthouse on cliff edge
  const lighthouseX = 190;
  
  // Tower
  ctx.fillStyle = '#4a4a4a';
  ctx.fillRect(lighthouseX, 35, 24, 50);
  
  // Top chamber
  ctx.fillStyle = '#5a5a5a';
  ctx.fillRect(lighthouseX - 2, 28, 28, 12);
  
  // Otherworldly beacon pulsing
  ctx.fillStyle = '#8a4aaa';
  ctx.globalAlpha = 0.5;
  ctx.fillRect(lighthouseX - 30, 20, 85, 30);
  ctx.globalAlpha = 0.3;
  ctx.fillRect(lighthouseX - 45, 15, 115, 40);
  ctx.globalAlpha = 1;
  
  // Unnatural colors in beam
  ctx.fillStyle = '#6a3a8a';
  ctx.globalAlpha = 0.4;
  ctx.fillRect(lighthouseX - 15, 25, 55, 20);
  ctx.globalAlpha = 1;
  
  ctx.fillStyle = '#aa6acc';
  ctx.fillRect(lighthouseX + 8, 30, 8, 8);
  
  // Shapes moving beneath waves
  ctx.fillStyle = '#0a2a1a';
  ctx.globalAlpha = 0.6;
  ctx.fillRect(40, 120, 30, 35);
  ctx.fillRect(100, 125, 35, 30);
  ctx.fillRect(160, 122, 28, 33);
  ctx.globalAlpha = 1;
}

function drawCaves(ctx) {
  // Dark cave
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, 128, 128);
  
  // Cave walls
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, 30, 128);
  ctx.fillRect(100, 0, 28, 128);
  ctx.fillRect(0, 0, 128, 25);
  
  // Phosphorescent fungi
  const fungiColors = ['#2a4a2a', '#2a2a4a', '#4a2a4a'];
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = fungiColors[i % 3];
    ctx.globalAlpha = 0.6;
    ctx.fillRect(
      30 + Math.random() * 70,
      25 + Math.random() * 90,
      5, 5
    );
  }
  ctx.globalAlpha = 1;
  
  // Ancient carvings
  ctx.strokeStyle = '#4a4a4a';
  ctx.beginPath();
  ctx.moveTo(40, 40);
  ctx.lineTo(60, 45);
  ctx.lineTo(55, 60);
  ctx.lineTo(70, 55);
  ctx.stroke();
}

function drawDesperation(ctx) {
  // Warping reality
  for (let i = 0; i < 128; i += 4) {
    for (let j = 0; j < 128; j += 4) {
      const distort = Math.sin(i * 0.1 + j * 0.1);
      ctx.fillStyle = `rgb(${20 + distort * 30}, ${10 + distort * 20}, ${30 + distort * 40})`;
      ctx.fillRect(i, j, 4, 4);
    }
  }
  
  // Running figure
  ctx.fillStyle = '#4a4a6a';
  ctx.fillRect(90, 80, 15, 30);
  ctx.fillRect(92, 75, 10, 8);
  
  // Collapsing buildings
  ctx.fillStyle = '#2a2a2a';
  ctx.globalAlpha = 0.7;
  ctx.fillRect(10, 60, 20, 40);
  ctx.fillRect(35, 70, 25, 35);
  ctx.globalAlpha = 1;
}

function drawTranscendence(ctx) {
  // Reality bending in multiple dimensions
  for (let i = 0; i < 256; i += 3) {
    for (let j = 0; j < 160; j += 3) {
      const centerX = 128;
      const centerY = 80;
      const dist = Math.sqrt((i - centerX) * (i - centerX) + (j - centerY) * (j - centerY));
      const angle = Math.atan2(j - centerY, i - centerX);
      
      const wave1 = Math.sin(dist * 0.08 + angle * 2) * 70;
      const wave2 = Math.cos(angle * 3 - dist * 0.05) * 50;
      const pulse = Math.sin(dist * 0.1) * 30;
      
      const r = Math.max(0, Math.min(255, 120 + wave1 + pulse));
      const g = Math.max(0, Math.min(255, 60 + wave2));
      const b = Math.max(0, Math.min(255, 180 + wave1 + wave2));
      
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(i, j, 3, 3);
    }
  }
  
  // Transcended figure (center, glowing)
  const figX = 108;
  const figY = 50;
  
  // Aura of power
  ctx.fillStyle = '#aa8acc';
  ctx.globalAlpha = 0.4;
  for (let i = 0; i < 5; i++) {
    const size = 80 - i * 12;
    ctx.fillRect(figX + 20 - size/2, figY + 30 - size/2, size, size);
  }
  ctx.globalAlpha = 1;
  
  // Body (semi-transparent, between states)
  ctx.fillStyle = '#8a8aaa';
  ctx.globalAlpha = 0.8;
  ctx.fillRect(figX + 5, figY + 20, 30, 60);
  ctx.globalAlpha = 0.9;
  ctx.fillRect(figX + 10, figY + 10, 20, 15);
  ctx.globalAlpha = 1;
  
  // Cosmic eyes
  ctx.fillStyle = '#ddccff';
  ctx.fillRect(figX + 13, figY + 15, 5, 5);
  ctx.fillRect(figX + 22, figY + 15, 5, 5);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(figX + 14, figY + 16, 3, 3);
  ctx.fillRect(figX + 23, figY + 16, 3, 3);
  
  // Energy radiating outward
  ctx.strokeStyle = '#aa6acc';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.6;
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const length = 40 + Math.sin(i * 0.5) * 10;
    ctx.beginPath();
    ctx.moveTo(figX + 20, figY + 50);
    ctx.lineTo(
      figX + 20 + Math.cos(angle) * length,
      figY + 50 + Math.sin(angle) * length
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  
  // Lornsmouth reshaping below
  ctx.fillStyle = '#3a3a5a';
  ctx.globalAlpha = 0.7;
  
  // Buildings warping, transforming
  const buildings = [
    [20, 120], [60, 118], [100, 122], [140, 119], [180, 121], [220, 120]
  ];
  
  buildings.forEach(([x, y], i) => {
    const warp = Math.sin(i * 0.8) * 5;
    ctx.fillRect(x + warp, y, 15, 40 - warp);
    // Strange geometry
    ctx.fillRect(x - 3 + warp, y + 10, 21, 3);
    ctx.fillRect(x + 5 + warp, y - 5, 5, 10);
  });
  ctx.globalAlpha = 1;
  
  // Stars spelling new name
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 20; i++) {
    const x = 10 + i * 12;
    const y = 15 + Math.sin(i * 0.5) * 8;
    ctx.fillRect(x, y, 2, 2);
  }
}

function drawGenericScene(ctx, stepNum) {
  // Atmospheric background based on step number
  const hue = (stepNum * 30) % 360;
  const saturation = 15 + (stepNum % 5) * 5;
  const lightness = 8 + (stepNum % 3) * 3;
  
  ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  ctx.fillRect(0, 0, 256, 160);
  
  // Add atmospheric fog/mist
  ctx.fillStyle = `hsl(${hue}, ${saturation + 10}%, ${lightness + 5}%)`;
  ctx.globalAlpha = 0.4;
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(
      Math.random() * 256,
      Math.random() * 160,
      Math.random() * 80 + 40,
      Math.random() * 40 + 20
    );
  }
  ctx.globalAlpha = 1;
  
  // Add some shadowy shapes
  ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness - 3}%)`;
  for (let i = 0; i < 8; i++) {
    const x = (i * 30 + stepNum * 7) % 256;
    const y = 80 + (i % 3) * 25;
    ctx.fillRect(x, y, 20 + i * 3, 40 + i * 2);
  }
}

// Show ending
function showEnding(step) {
  let endingClass = 'ending-escape';
  let endingTitle = '';
  let titleColor = 'var(--color-safe)';
  
  switch(step.endingType) {
    case 'madness':
      endingClass = 'ending-madness';
      endingTitle = '⚠️ MADNESS CLAIMS YOU ⚠️';
      titleColor = 'var(--color-danger)';
      break;
    case 'escape':
      endingClass = 'ending-escape';
      endingTitle = '✓ YOU ESCAPED... BUT AT WHAT COST? ✓';
      titleColor = 'var(--color-safe)';
      break;
    case 'guardian':
      endingClass = 'ending-guardian';
      endingTitle = '🛡️ THE ETERNAL GUARDIAN 🛡️';
      titleColor = 'var(--color-accent)';
      break;
    case 'transcendence':
      endingClass = 'ending-transcendence';
      endingTitle = '♾️ BEYOND MORTALITY ♾️';
      titleColor = 'var(--color-warning)';
      break;
    default:
      endingTitle = '✓ THE END ✓';
  }
  
  elements.choicesContainer.innerHTML = '';
  
  const endingMessage = document.createElement('div');
  endingMessage.className = `story-container ${endingClass}`;
  endingMessage.style.marginTop = '20px';
  endingMessage.style.textAlign = 'center';
  
  const heading = document.createElement('h3');
  heading.style.marginBottom = '15px';
  heading.style.fontSize = '1.3rem';
  heading.style.textTransform = 'uppercase';
  heading.style.letterSpacing = '0.1em';
  heading.textContent = endingTitle;
  heading.style.color = titleColor;
  
  const finalSanity = document.createElement('p');
  finalSanity.textContent = `Final Sanity: ${sanity}/100`;
  finalSanity.style.fontSize = '1rem';
  finalSanity.style.marginTop = '10px';
  finalSanity.style.fontStyle = 'italic';
  
  endingMessage.appendChild(heading);
  endingMessage.appendChild(finalSanity);
  elements.choicesContainer.appendChild(endingMessage);
  
  // Show restart button
  elements.restartBtn.classList.remove('hidden');
}

// Restart game
function restartGame() {
  currentStep = 1;
  sanity = 100;
  visitedSteps.clear();
  
  elements.restartBtn.classList.add('hidden');
  elements.header.classList.remove('hidden');
  updateSanityDisplay();
  loadStep(1);
}

// Start the game when page loads
window.addEventListener('DOMContentLoaded', init);
