// TODO
game.PlayerEntity = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, {
                image: "mario",
                spritewidth: "128",
                spriteheight: "128",
                width: 128,
                height: 128,
                getShape: function() {
                    return (new me.Rect(0, 0, 20, 128)).toPolygon();
                }
            }]);

//this is where I render my charecter animation 

        this.renderable.addAnimation("idle", [3]);
        //creat an animation caalled smallWalk using pictures of the image defined above (mario)
        //sets the animation to run through pictures 8-12
        // the last numnber says we sswitch between pictures every 80 milliseconds
        this.renderable.addAnimation("smallWalk", [8, 9, 10, 11, 12], 80);

        this.renderable.setCurrentAnimation("idle");


// it sets the speed we go on the x axis 1st number and y axis second number
        this.body.setVelocity(3 , 20);
        
        // sets the camer (viewport) to follow marios position(pos) on both the x and y axis
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
    },
    update: function(delta) {
        // it checks if the right key is pressed and if it is it execute the following statement
        if (me.input.isKeyPressed("right")) {
            // sets the position of mario on the x axis by adding the x value from the setVelocity times the timer.tick
            //me.timer.tick uses the time since last animation to make the distance traveled smooth
            this.body.vel.x += this.body.accel.x * me.timer.tick;
            this.flipX(false);
        }
       if(me.input.isKeyPressed('left')) {
        // flip the sprite on horizontal axis
        this.flipX(true);
        }
        
        else {
            this.body.vel.x = 0;
        }
        
        if(me.input.isKeyPressed("up")) {
            if(!this.body.jumping && !this.body.falling) {
                this.body.jumping = true;
                this.body.vel.y -= this.body.accel.y * me.timer.tick;
            }
        }

        this.body.update(delta);
        me.collision.check(this, true, this.collideHandler.bind(this), true);

        if (this.body.vel.x !== 0) {
            if (!this.renderable.isCurrentAnimation("smallWalk")) {
                this.renderable.setCurrentAnimation("smallWalk");
                this.renderable.setAnimationFrame();
            }
           
        } else {
            this.renderable.setCurrentAnimation("idle");
        }

        this.body.update(delta);
        this._super(me.Entity, "update", [delta]);
         return true;
    },
    
    collideHandler: function(response) {
        var ydif = this.pos.y - response.b.pos.y;
        
 if(response.b.type === 'badguy') {
     if(ydif<= -115){
      response.b.alive = false;   
     }else {
         me.state.change(me.state.MENU);
     }
 }       
    }
    
    
});

game.LevelTrigger = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, settings]);
        this.body.onCollision = this.onCollision.bind(this);
        this.level = settings.level;
        this.xSpawn = settings.xSpawn;
        this.ySpawn = settings.ySpawn;
    },
    
    onCollision: function() {
    this.body.setCollisionMask(me.collision.types.NO_OBJECT);
    me.levelDirector.loadLevel(this.level);
    me.state.current().resetPlayer(this.xSpawn, this.ySpawn);
    
    }
    
}); 

game.BadGuy = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, {
                image: "slime",
                spritewidth: "60",
                spriteheight: "28",
                width: 60,
                height: 28,
                getShape: function() {
                    return (new me.Rect(0, 0, 60, 28)).toPolygon();
                }
            }]);
        
        this.spritewidth = 60;
        var width = settings.width;
        x = this.pos.x;
        this.startX = x;
        this.endX = x + width - this.spritewidth;
        this.pos.x = x + width - this.spritewidth;
        this.updateBounds();
        
        this.alwaysUpdate = true;
        
        this.walkLeft = false;
        this.alive = true;
        this.type = "badguy";    
        
        this.body.setVelocity(4, 6);
    },

         update: function(delta) {
             this.body.update(delta);
             me.collision.check(this, true, this.collideHandler.bind(this), true);
             if(this.alive) {
                 console.log(this.walkLeft + " " + this.pos.x + " " + this.startX + " " + this.endX);
                 
                 if(this.walkLeft && this.pos.x <= this.startX) {
                     console.log("Going right");
                     this.walkLeft = false;
                 }else if(!this.walkLeft && this.pos.x >= this.endX) {
                     console.log("Going left");
                     this.walkLeft = true;
                 }
                 this.flipX(!this.walkLeft);
                 this.body.vel.x += (this.walkLeft) ? -this.body.accel.x * me.timer.tick : this.body.accel.x * me.timer.tick;
                 
             }else {
                 me.game.world.removeChild(this);
             }
             
             this._super(me.Entity, "update", [delta]);
             return true;
    },
 
    collideHandler: function() {
         
    }
    
});