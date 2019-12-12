// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
let app = new PIXI.Application(600,600);
document.querySelector("#gameWindow").appendChild(app.view);
//document.body.appendChild(app.view);
app.renderer.resize(1000,700);


// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;	
// aliases
let stage;

// game variables
let startScene;
let gameScene,scoreLabel,lifeLabel,bossLifeLabel,gameOverScoreLabel,keysDiv;
let keysDown = {};
let gameOverScene;

//player stuff
let player;
let playerSheet;
let isJumping;
let jumpVelocity;
let jumpAcceleration;
let isAttacking;
let isHowling;
let isFacingRight;
let onPlatform;
let playerDamage;
let playerInvulnerableReset;
let playerInvulnerableTime;

let clawSheet;
let claw;
let clawAliveDuration;
let clawAliveTime;

let howlResetDuration;
let howlTime;
let howlDamageBuffTime;

//boss stuff
let boss;
let bossSheet;
let bossActionResetTime;
let bossActionTime;
let bossHitResetTime;
let bossHitTime;
let bossAttackResetTimer;
let bossAttackInterval;

let laser;
let laserSheet;
let laserAliveDuration;
let laserAliveTime;

let pillar;
let pillarSheet;
let pillarAliveDuration;
let pillarAliveTime;

let drop;
let dropSheet;
let dropAliveDuration;
let dropAliveTime;

let ability;
let abilitySheet;
let abilityAliveDuration;
let abilityAliveTime;

//background and floor textures
let background;
let backgroundSheet;
let floor;
let floorSheet;

//gameplay variables
let score = 0;
let playerLife = 100;
let bossLife = 100;
let levelNum = 1;
let paused = true;
let gameOverTime;




//player textures and stuff (lycan sprite sheet)
let lycanIdleTextures;

let clawEffect = [];
let clawEffectTextures;

let lycanSpriteSheetName = "images/json_files/Lycan.json";
let pianusSpriteSheetName = "images/json_files/Pianus.json";
let backgroundSpriteSheetName = "images/json_files/Backgrounds.json";

PIXI.loader
    .add(lycanSpriteSheetName)
    .add(pianusSpriteSheetName)
    .add(backgroundSpriteSheetName)
    .load(setup);

const keys = Object.freeze({
    SHIFT: 16,
    CTRL: 17,
    SPACE: 32,  // Jump
    UP: 87,     // W
    LEFT: 65,   // A
    DOWN: 83,   // S
    RIGHT: 68,  // D  
    ATTACK: 72, // H
    HOWL: 74,   // J
});

window.onload = function () {
    keysDiv = document.querySelector("#keys");

    window.addEventListener("keydown", registerKeyDown);
    window.addEventListener("keyup", registerKeyUp);
}
        
function registerKeyDown(e) {
    keysDown[e.keyCode] = true;
}

function registerKeyUp(e) {
    keysDown[e.keyCode] = false;
}

function setup(){
    stage = app.stage;
    
    //creating start scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);
    
    //creating main game and making it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);
    
    //creating game over scene and making invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);
    
    //add sprite sheet stuff
    LycanSpriteSheetJson();
    PianusSpriteSheetJson();
    BackgroundSpriteSheetJson();
    
    //creating the background
    createBackground();
    gameScene.addChild(background);
    gameScene.addChild(floor);
    
    //creating player
    createPlayer();
    gameScene.addChild(player);
    
    //creating boss
    createBoss();
    gameScene.addChild(boss);
    BossLaser();
    gameScene.addChild(laser);
    BossPillar();
    gameScene.addChild(pillar);
    BossDrop();
    gameScene.addChild(drop);
    BossAbility();
    gameScene.addChild(ability);
    
    //creating player claws
    ClawSlash();
    gameScene.addChild(claw);
    
    //creating labels for scenes
    createLabelsAndButtons();
    
    //start update loop
    app.ticker.add(gameLoop);
    
    //add key board stuff
}

function createLabelsAndButtons(){
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 48,
        fontFamily: "Verdana"
    });
    
    //setup startScene
    let title = new PIXI.Text("Pianus Boss Fight!");
    title.style = new PIXI.TextStyle({
        fill: 0xffffff,
        fontSize: 75,
        fontFamily: 'Verdana',
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    title.x = 50;
    title.y = 120;
    startScene.addChild(title);
    
    let myName = new PIXI.Text("By: Allan Ng");
    myName.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 32,
        fontFamily: 'Verdana',
        fontStyle: 'italic',
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    myName.x = 185;
    myName.y = 300;
    startScene.addChild(myName);
    
    //making buttons
    
    let startButton = new PIXI.Text("Start Game");
    startButton.style = buttonStyle;
    startButton.x = 80;
    startButton.y = sceneHeight - 100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup" ,startGame); // startGame is a function reference
    startButton.on('pointerover',e=>e.target.alpha = 0.7); // consise arrow function with no brackets
    startButton.on('pointerout',e=>e.currentTarget.alpha = 1.0); // ditto
    startScene.addChild(startButton);
    
    //setup gameScene
    let textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 18,
        fontFamily: 'Verdana',
        stroke: 0xFF0000,
        strokeThickness: 4
    });
    
    //score label
    scoreLabel = new PIXI.Text();
    scoreLabel.style = textStyle;
    scoreLabel.x = 5;
    scoreLabel.y = 5;
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);
    
    //life label
    lifeLabel = new PIXI.Text();
    lifeLabel.style = textStyle;
    lifeLabel.x = 5;
    lifeLabel.y = 26;
    gameScene.addChild(lifeLabel);
    decreaseLifeBy(0);
    
    //boss life label
    bossLifeLabel = new PIXI.Text();
    bossLifeLabel.style = textStyle;
    bossLifeLabel.x = 5;
    bossLifeLabel.y = 47;
    gameScene.addChild(bossLifeLabel);
    decreaseBossLife(0);
    
    //setup gameOverScene
    let gameOverText = new PIXI.Text("Game Over!\n      :-0");
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 64,
        fontFamily: 'Verdana',
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    gameOverText.style = textStyle;
    gameOverText.x = 100;
    gameOverText.y = sceneHeight/2 - 160;
    gameOverScene.addChild(gameOverText);
    
    gameOverScoreLabel = new PIXI.Text("Your final score: " + score);
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 32,
        fontFamily: 'Verdana',
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    gameOverScoreLabel.style = textStyle;
    gameOverScoreLabel.x = 150;
    gameOverScoreLabel.y = sceneHeight - 200;
    gameOverScene.addChild(gameOverScoreLabel);
    
    //make play again button
    let playAgainButton = new PIXI.Text("Play Again?");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = 150;
    playAgainButton.y = sceneHeight - 100;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup", startGame); //startGame is a function reference
    playAgainButton.on('pointerover',e=>e.target.alpha = 0.7); // concise arrow functio nwith no brackets
    playAgainButton.on('pointerout',e=>e.currentTarget.alpha = 1.0); //ditto
    gameOverScene.addChild(playAgainButton);
}

function increaseScoreBy(value){
    score += value;
    scoreLabel.text = 'Score          ' + score;
}

function decreaseBossLife(value){
    bossLife -= value;
    bossLifeLabel.text = 'Boss Life     ' + bossLife;
}

function decreaseScoreBy(value){
    score -= value;
    if(score < 0){
        score = 0;
    }
    scoreLabel.text = 'Score          ' + score;
}

function decreaseLifeBy(value){
    playerLife -= value;
    playerLife = parseInt(playerLife);
    decreaseScoreBy(value);
    lifeLabel.text = 'Life             ' + playerLife + "%";
}

function gameLoop(){
    if(!paused){
        
        AutomaticActions();
        PlayerActions();
        BossActions();
        Collisions();
        GameOverRequirements();
    }
}

function GameOverRequirements(){
    if(playerLife <= 0){
        gameOverTime--;
        if(gameOverTime <= 0){
            lose();
            return;
        }
    }
    if(bossLife <= 0){
        gameOverTime--;
        if(gameOverTime <= 0){
            win();
            return;
        }
    }
    
    
}

function AutomaticActions(){
    keysDiv.innerHTML = JSON.stringify(keysDown);

    //Automatic Actions in the game 

    //keep player in bounds
    if(player.x < 0)
        player.x = 0;
    
    //checks to see where the player is facing and flip the sprites if needed
    if(isFacingRight){
        player.scale.x = -1;
    }else{
        player.scale.x = 1;
    }

    //gravity
    if(isJumping){
        jumpAcceleration++;
        player.y += jumpAcceleration;
    }

    //jumping code that gets run if the player is jumping
    if(player.y >= 450){
        player.y = 450;
        isJumping = false;
        jumpAcceleration++;
    }
    if(jumpVelocity > 0){
        player.y -= jumpVelocity;
        jumpVelocity--;
    }

    //statements to display claw for a set duration
    if(claw.isAlive){
        clawAliveTime--;
    }
    if(clawAliveTime <= 0){
        claw.isAlive = false;
        claw.visible = false;
        isAttacking = false;
    }

    //statements to change howl duration
    if(isHowling){
        howlTime--;
    }
    if(howlTime == 0){
        isHowling = false;
    }
    
    //player invulnerable time countdown
    if(playerInvulnerableTime != 0){
        playerInvulnerableTime--;
    }
    
    //player howl duration
    if(howlDamageBuffTime != 0){
        howlDamageBuffTime--;
        playerDamage = 15;
    }else{
        howlDamageBuffTime = 0;
        playerDamage = 10;
    }
    
    //statements to display laser for a set duration
    if(laser.isAlive){
        laserAliveTime--;
    }
    if(laserAliveTime <= 0){
        laser.isAlive = false;
        laser.visible = false;
    }
    
    //statements to display pillars for a set duration
    if(pillar.isAlive){
        pillarAliveTime--;
    }
    if(pillarAliveTime <= 0){
        pillar.isAlive = false;
        pillar.visible = false;
    }
    
    //statements to display drop for a set duration
    if(drop.isAlive){
        dropAliveTime--;
    }
    if(dropAliveTime <= 0){
        drop.isAlive = false;
        drop.visible = false;
    }
    
    //statements to display ability for a set duration
    if(ability.isAlive){
        abilityAliveTime--;
    }
    if(abilityAliveTime <= 0){
        ability.isAlive = false;
        ability.visible = false;
    }
}

function Collisions(){
    //claw to boss
    if(rectsIntersect(claw,boss, claw.width, boss.width)){
        if(claw.isAlive && !claw.hit){
            claw.hit = true;
            decreaseBossLife(playerDamage);
            bossHitTime += bossHitResetTime;
            increaseScoreBy(playerDamage);
        }
    }
    
    //boss to player
    //checks to see if player collides with boss and if they are invulnerable or not
                                            // setting my own player width because the sprite is too big
    if(rectsIntersect(boss,player, boss.width, 120) && playerInvulnerableTime == 0){
        playerInvulnerableTime += playerInvulnerableReset;
        player.x -= 80;
        decreaseLifeBy(10);
    }
    
    //laser to player                                                                 //hits on the very last frame of the laser
    if(rectsIntersect(laser,player,laser.width,120) && playerInvulnerableTime == 0 && laserAliveTime == 1){
        playerInvulnerableTime += playerInvulnerableReset;
        player.x -= 100;
        decreaseLifeBy(20);
    }
    
    //pillar to player
    if(rectsIntersect(pillar,player,pillar.width,120) && playerInvulnerableTime == 0 && pillarAliveTime == 10){
        playerInvulnerableTime += playerInvulnerableReset;
        player.x -= 100;
        decreaseLifeBy(10);
    }
    //drop to player
    if(rectsIntersect(drop,player,drop.width,120) && playerInvulnerableTime == 0 && dropAliveTime == 5){
        playerInvulnerableTime += playerInvulnerableReset;
        player.x -= 100;
        decreaseLifeBy(15);
    }
}

function BossActions(){
    if(bossHitTime > 0){
        bossHitTime--;
    }
    if(bossHitTime != 0){
        boss.textures = bossSheet.hit.textures;
        if(!boss.playing){
            boss.textures = bossSheet.hit.textures;
            boss.play();
        }
    }else if(bossLife <= 0){
        boss.textures = bossSheet.death.textures;
        boss.play();
        if(!boss.playing){
            boss.textures = bossSheet.death.textures;
            boss.play();
        }
    }else{
        if(!boss.playing){
            boss.textures = bossSheet.idle.textures;
            boss.animationSpeed = 0.25;
            boss.play();
        }
    }
    
    if(bossAttackInterval == 0){
        let num = Math.floor(Math.random() * 3);
        if(num == 0){//attacks with laser
            laser.isAlive = true;
            laser.visible = true;
            laser.hit = false;
            laserAliveTime += laserAliveDuration;
            laserSheet.play();
        }else if(num == 1){//attacks with pillars
            pillar.isAlive = true;
            pillar.visible = true;
            pillar.x = player.x;
            pillar.hit = false;
            pillarAliveTime += pillarAliveDuration;
            pillarSheet.play();
        }else{//attacks with drops
            drop.isAlive = true;
            drop.visible = true;
            drop.x = player.x;
            drop.hit = false;
            dropAliveTime += dropAliveDuration;
            dropSheet.play();
        }
        //play boss ability
        ability.isAlive = true;
        ability.visible = true;
        abilityAliveTime += abilityAliveDuration;
        abilitySheet.play();
        //boss stuff
        bossAttackInterval += bossAttackResetTimer;
        boss.textures = bossSheet.attack.textures;
        boss.animationSpeed = 0.2;
        boss.play();
    }
    if(bossAttackInterval > 0){
        bossAttackInterval--;
    }
}

function PlayerActions(){
    //Player Actions

    //checks to see if player gets hit and becomes invulnerable
    if(playerInvulnerableTime != 0){
        player.textures = playerSheet.hit.textures;
        player.play();
    }
    //Attack
    //checks to see if player is attacking or howling (no overlapping actions)
    else if(keysDown[keys.ATTACK] && clawAliveTime == 0 && !isAttacking && !isHowling){
        isAttacking = true;
        if(isFacingRight){
            claw.x = player.x + 200;
        }else{
            claw.x = player.x - 200;
        }
        claw.y = player.y;
        claw.isAlive = true;
        claw.visible = true;
        claw.hit = false;
        clawAliveTime += clawAliveDuration;
        //change animation to attack
        if(player.textures != playerSheet.attack.textures){
            player.textures = playerSheet.attack.textures;
            player.animationSpeed = 0.4;
        }
        if(!player.playing){
            player.textures = playerSheet.attack.textures;
            player.play();
        }
        clawSheet.play();
    }
    //Howl
    //checks to see if player is attacking or howling (no overlapping actions)
    else if(keysDown[keys.HOWL] && !isAttacking && !isHowling && howlDamageBuffTime == 0){
        isHowling = true;
        howlTime += howlResetDuration;
        howlDamageBuffTime += 150;
        //change animation to howl
        if(player.textures != playerSheet.howl.textures){
            player.textures = playerSheet.howl.textures;
            player.animationSpeed = 0.2;
        }
        if(!player.playing){
            player.loop = false;
            player.play();
        }
    }
    //Movement
    //checks to see if player is attacking or howling (no overlapping actions)
    else if(!isAttacking && !isHowling){
        //checks to see if a movement key is pressed
        if(keysDown[keys.RIGHT] || keysDown[keys.LEFT] || keysDown[keys.UP] || keysDown[keys.DOWN]){
            if(keysDown[keys.RIGHT]){
                player.x += 8;
                isFacingRight = true;
                //change animation to walk
                if(player.textures != playerSheet.walk.textures){
                    player.textures = playerSheet.walk.textures;
                    player.animationSpeed = 0.15;
                    player.loop = false;
                }
                if(!player.playing){
                    player.textures = playerSheet.walk.textures;
                    player.play();
                }
            }
            if(keysDown[keys.LEFT]){
                player.x -= 8;
                isFacingRight = false;
                //change animation to walk
                if(player.textures != playerSheet.walk.textures){
                    player.textures = playerSheet.walk.textures;
                    player.animationSpeed = 0.15;
                }
                if(!player.playing){
                    player.textures = playerSheet.walk.textures;
                    player.play();
                }
            }
            if(keysDown[keys.UP] && isJumping == false){
                jumpVelocity = 35;
                isJumping = true;
                jumpAcceleration = 5;
                //change animation to idle
                if(player.textures != playerSheet.idle.textures){
                    player.textures = playerSheet.idle.textures;
                    player.animationSpeed = 2;
                }
                if(!player.playing){
                    player.textures = playerSheet.idle.textures;
                    player.play();
                }
            }
            if(keysDown[keys.DOWN] && onPlatform){ //checks to see if the player is on the platform
                player.y -= 10;
                //change animation to idle
                if(player.textures != playerSheet.idle.textures){
                    player.textures = playerSheet.idle.textures;
                    player.animationSpeed = 2;
                }
                if(!player.playing){
                    player.textures = playerSheet.idle.textures;
                    player.play();
                }
            }
        }
        //nothing is pressed play idle animation
        else{
            if(player.textures != playerSheet.idle.textures){
                player.textures = playerSheet.idle.textures;
                player.animationSpeed = 0.2;
            }
            if(!player.playing){
                player.textures = playerSheet.idle.textures;
                player.animationSpeed = 0.2;
                player.play();
            }
        }
    }
    
}

function loadLevel(){
    
    
    paused = false;
}

function lose(){
    gameOverScoreLabel.text = "You Lose!\nYour final score: " + score;
    
    paused = true;
    
    gameOverScene.visible = true;
    gameScene.visible = false;
}

function win(){
    gameOverScoreLabel.text = "You Win!\nYour final score: " + score;
    
    paused = true;
    
    gameOverScene.visible = true;
    gameScene.visible = false;
}


function startGame(){
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    levelNum = 1;
    score = 0;
    playerLife = 100;
    increaseScoreBy(0);
    decreaseLifeBy(0);
    player.x = 100;
    player.y = 450;
    isJumping = false;
    jumpVelocity = 0;
    jumpAcceleration = 0;
    isAttacking = false;
    isHowling = false;
    isFacingRight = true;
    onPlatform = false;
    playerDamage = 10;
    playerInvulnerableReset = 10;
    playerInvulnerableTime = 0;
    clawAliveDuration = 30;
    clawAliveTime = 0;
    howlResetDuration = 30;
    howlTime = 0;
    howlDamageBuffTime = 0;
    laserAliveDuration = 30;
    laserAliveTime = 0;
    pillarAliveDuration = 30;
    pillarAliveTime = 0;
    abilityAliveDuration = 30;
    abilityAliveTime = 0;
    dropAliveDuration = 30;
    dropAliveTime = 0;
    boss.x = 900;
    boss.y = 375;
    bossActionResetTime = 150;
    bossActionTime = 0;
    bossHitResetTime = 10;
    bossHitTime = 0;
    bossAttackResetTimer = 150;
    bossAttackInterval = 150;
    bossLife = 100;
    gameOverTime = 100;
    //loadBackground();
    loadLevel();
}

function createBackground(){
    background = backgroundSheet;
    floor = floorSheet;
    floor.y = 530;
}

//creating the player
function createPlayer(){
    player = playerSheet.idle;
    player.anchor.set(0.5);
    player.loop = true;
    player.x = app.view.width / 2;
    player.y = app.view.height / 2;
}

function ClawSlash(){
    claw = clawSheet;
    claw.anchor.set(0.5);
    claw.loop = true;
    claw.x = 300;
    claw.y = 300;
    claw.hit = false;
    claw.isAlive = false;
    claw.visible = false;
}

function createBoss(){
    boss = bossSheet.hit;
    boss.anchor.set(0.5);
    boss.loop = true;
    boss.x = app.view.width / 2;
    boss.y = app.view.height / 2;
}

function BossLaser(){
    laser = laserSheet;
    laser.anchor.set(0.5,1);
    laser.loop = true;
    laser.x = 455;
    laser.y = 600;
    laser.hit = false;
    laser.isAlive = false;
    laser.visible = false;
}

function BossPillar(){
    pillar = pillarSheet;
    pillar.anchor.set(0.5);
    pillar.loop = true;
    pillar.x = 100;
    pillar.y = 440;
    pillar.hit = false;
    pillar.isAlive = false;
    pillar.visible = false;
}

function BossDrop(){
    drop = dropSheet;
    drop.anchor.set(0.5, 1);
    drop.loop = true;
    drop.x = 100;
    drop.y = 550;
    drop.hit = false;
    drop.isAlive = false;
    drop.visible = false;
}

function BossAbility(){
    ability = abilitySheet;
    ability.anchor.set(0.5);
    ability.loop = true;
    ability.x = 850;
    ability.y = 200;
    ability.isAlive = false;
    ability.visible = false;
}

function LycanSpriteSheetJson(){
    playerSheet = {};
    
    let lycanSpriteSheet = PIXI.loader.resources[lycanSpriteSheetName];
    
    playerSheet["idle"] = new PIXI.AnimatedSprite.fromFrames(lycanSpriteSheet.data.animations["Lycan_Idle"]);
    playerSheet["attack"] = new PIXI.AnimatedSprite.fromFrames(lycanSpriteSheet.data.animations["Lycan_Attack"]);
    playerSheet["howl"] = new PIXI.AnimatedSprite.fromFrames(lycanSpriteSheet.data.animations["Lycan_Howl"]);
    playerSheet["death"] = new PIXI.AnimatedSprite.fromFrames(lycanSpriteSheet.data.animations["Lycan_Death"]);
    playerSheet["walk"] = new PIXI.AnimatedSprite.fromFrames(lycanSpriteSheet.data.animations["Lycan_Walk"]);
    playerSheet["hit"] = new PIXI.AnimatedSprite.fromFrames(lycanSpriteSheet.data.animations["Lycan_Hit"]);
    
    clawSheet = {};
    clawSheet = new PIXI.AnimatedSprite.fromFrames(lycanSpriteSheet.data.animations["Lycan_Attack_Effect"]);
    clawSheet.animationSpeed = 0.2; //5 fps
}

function PianusSpriteSheetJson(){
    bossSheet = {};
    let pianusSpriteSheet = PIXI.loader.resources[pianusSpriteSheetName];
    
    bossSheet["idle"] = new PIXI.AnimatedSprite.fromFrames(pianusSpriteSheet.data.animations["Pianus_Idle"]);
    bossSheet["attack"] = new PIXI.AnimatedSprite.fromFrames(pianusSpriteSheet.data.animations["Pianus_Attack"]);
    bossSheet["hit"] = new PIXI.AnimatedSprite.fromFrames(pianusSpriteSheet.data.animations["Pianus_Hit"]);
    bossSheet["death"] = new PIXI.AnimatedSprite.fromFrames(pianusSpriteSheet.data.animations["Pianus_Death"]);
    
    laserSheet = {};
    laserSheet = new PIXI.AnimatedSprite.fromFrames(pianusSpriteSheet.data.animations["Pianus_Laser"]);
    laserSheet.animationSpeed = 0.4;
    
    pillarSheet = {};
    pillarSheet = new PIXI.AnimatedSprite.fromFrames(pianusSpriteSheet.data.animations["Pianus_Pillar"]);
    pillarSheet.animationSpeed = 0.2;
    
    
    dropSheet = {};
    dropSheet = new PIXI.AnimatedSprite.fromFrames(pianusSpriteSheet.data.animations["Pianus_Drop"]);
    dropSheet.animationSpeed = 0.8;
    
    
    abilitySheet = {};
    abilitySheet = new PIXI.AnimatedSprite.fromFrames(pianusSpriteSheet.data.animations["Pianus_Ability"]);
    abilitySheet.animationSpeed = 0.4545;
}

function BackgroundSpriteSheetJson(){
    backgroundSheet = {};
    let backgroundSpriteSheet = PIXI.loader.resources[backgroundSpriteSheetName];
    backgroundSheet = new PIXI.AnimatedSprite.fromFrames(backgroundSpriteSheet.data.animations["background"]);
    
    floorSheet = {};
    floorSheet = new PIXI.AnimatedSprite.fromFrames(backgroundSpriteSheet.data.animations["floor"]);
}