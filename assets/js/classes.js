//class Player extends PIXI.AnimatedSprite{
//    constructor(x=0, y=0){
//        //super();
//        //this.beginFill(0xFF0000);
//        //this.drawCircle(0,0,50);
//        //this.endFill();
//        //this.x = 0;
//        //this.y = 0;
//        //this.isAlive = true;
//        //super();
//        //this.anchor.set(.5,.5); // position, scaling, rotating etc are now from center of sprite
//        //this.scale.set(0.1);
//        //this.x = x;
//        //this.y = y;
//        super();
//        this.anchor.set(0.5);
//        this.animationSpeed = .5;
//        this.loop = false;
//        this.x = app.view.width/2;
//        this.y = app.view.height/2;
//        player.play();
//    }
//}

class Boss extends PIXI.Sprite{
    constructor(x=0, y=0){
        super();
        //this.beginFill(0xFF0000);
        //this.drawCircle(0,0,100);
        //this.endFill();
        this.anchor.set(.5,.5); // position, scaling, rotating etc are now from center of sprite
        this.scale.set(0.1);
        this.x = 0;
        this.y = 0;
        this.isAlive = true;
    }
}