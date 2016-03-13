"use strict";

/* singleton */

var text = {
    init: function(){
        text = game.add.text(game.world.centerX, game.world.centerY, '0');
        text.anchor.set(0.5);
        text.font = 'Verdana';
        text.fontSize = 36;
        text.fill = '#ffffff';
        text.text = "...";

    },
}

var judge = {
    perfectwindow: 50,
    okwindow: 100,
    score: 0,
    init: function(frame){
        judge.frame = frame;
        judge.scoretext = game.add.text(game.world.centerX, game.world.centerY, '0');
        judge.scoretext.anchor.set(0.5);
        judge.scoretext.font = 'Verdana';
        judge.scoretext.fontSize = 36;
        judge.scoretext.fill = '#ffffff';
        judge.scoretext.alpha = 1;
    },
}

var Music = {
    loaded: false,
    /* a prototype function. do not use */
    loadjson: function(json){
        this.sound = game.add.audio('tear');
        
        this.beatlist = json.beatlist;
        this.beatpos = 0;

        this.restart_off = 0;
        this.offset = json.offset;
        this.period = json.period;
        this.loaded = true;
        this.t = 0;
        this.prevt = 0;
    },

    update: function(){
        this.prevt = this.t;
        if(this.loaded){
            this.t = this.sound.currentTime + this.restart_off;
        }
        if(this.prevt >= this.t){
            this.t += game.time.physicsElapsed;
        }
    },

    queuebeat: function(){
        var beatlistlength = this.beatlist.length;

        var beatdata = this.beatlist[this.beatpos];
        while(this.beatpos != beatlistlength && beatdata[0] - this.t <= 4000){
            
            beatdata = this.beatlist[this.beatpos];
            
            var beat = Object.create(Beat);
            beat.load(beatdata);
            
            sprites.push(beat);
            this.beatpos += 1;
        }
    }
}

var stage = {
    update: function(){
        console.log("Nothing to stage");
    }
}


function preload(){
}

function create(){

    /* loads the prestage */
    game.stage.backgroundColor = 0x999999;

    game.load.onLoadStart.add(loadStart, this);
    game.load.onLoadComplete.add(loadComplete, this);

    game.load.audio('tear', 'assets/tearrain.mp3');
    game.load.image('marisa', 'assets/marisa2.png');
    game.load.image('tewi', 'assets/tewi.png');
    game.load.image('load', 'assets/load.png');
    game.load.image('rem', 'assets/rem.png');
    game.load.image('line', 'assets/line.png');
    game.load.image('fall2', 'assets/fall2.png');
    game.load.spritesheet('emoji', 'assets/apple.png', 32, 32, 1681);
    game.load.text('song', 'assets/song.json');

    text.init();

    game.load.start();
}

function update(){
    stage.update();
}

function render() {
}

function loadStart(){
    /* loads everything at the start */
    text.text = "Loading";
}

var Beat = {
    load: function(beatdata){
        this.sprite = game.add.sprite(game.world.centerX, 100, 'emoji');
        this.sprite.inputEnabled = true;
        this.sprite.anchor.setTo(0.5, 0.5);
        this.timing = beatdata[0];
        this.lane = beatdata[1];
        this.glyph = beatdata[2];
        this.sprite.x = (widths/4) + this.lane*(widths/4);
        this.sprite.frame = this.glyph;
        this.erased = false;
    },
    kill: function(){
        this.sprite.kill();
    }
}



function loadComplete(){

    /* loads the stage */
    text.text = "Loaded";

    music.loadjson(JSON.parse(game.cache.getText('song')));

    music.sound.play();

    judge.init(music.period * 2);

    var marisa1 = game.add.sprite(0, 0, 'marisa');

    scanline = game.add.sprite(widths/2, heights*5/6, 'fall2');
    scanline.anchor.setTo(0.5, 0.5);
    scanline.scale.setTo(320/800.0,320/800.0);

    key.z = game.input.keyboard.addKey(Phaser.Keyboard.Z);
    key.x = game.input.keyboard.addKey(Phaser.Keyboard.X);
    key.c = game.input.keyboard.addKey(Phaser.Keyboard.C);
    key.z.onDown.add(keyActivate('z'));
    key.x.onDown.add(keyActivate('x'));
    key.c.onDown.add(keyActivate('c'));

    if(debug){
        key.v = game.input.keyboard.addKey(Phaser.Keyboard.V);
        key.a = game.input.keyboard.addKey(Phaser.Keyboard.A);
        key.s = game.input.keyboard.addKey(Phaser.Keyboard.S);
        key.d = game.input.keyboard.addKey(Phaser.Keyboard.D);
        key.v.onDown.add(keyActivate('v'));
        key.a.onDown.add(keyActivate('a'));
        key.s.onDown.add(keyActivate('s'));
        key.d.onDown.add(keyActivate('d'));
        game.input.onUp.add(mouseActivate, this);
    }
    else{
        game.input.onTap.add(mouseKeyActivate, this);
    }

    stage.update = function(){
        music.update();

        
        var t = music.t;
        console.log(t);

        if (music.sound.isDecoding){
            text.text = "Loading song."
            game.world.bringToTop(text);
            return;
        }

        music.queuebeat();
        
        var linesnew = [];
        if(linecover < t+2000){
            linecover = Math.round((linecover-music.offset)/music.period)*music.period + music.offset;

            var line = game.add.sprite(game.world.centerX, 100, 'line');
            line.anchor.setTo(0.5, 0.5);
            line.timing = linecover;
            console.log(line.timing+" "+ music.period);
            lines.push(line);
            linecover += music.period;
        }
        lines.forEach(function(e,i,a){
            e.y = 500 - ((e.timing - t)/judge.frame * 400);
            if(e.y >= 600 || e.erased){
                e.kill();
            }
            else{
                linesnew.push(e);
            }
        });
        lines = linesnew;
        

        var spritesnew = [];
        sprites.forEach(function(e,i,a){
            e.sprite.y = (heights*5/6) - ((e.timing - t)/judge.frame * (heights*5/6));
            console.log(e.sprite.y);

            if(t - e.timing >= 300){
                if(e.sprite.frame != 208 && e.sprite.frame != 46){
                    e.sprite.frame = 86;
                }
            }

            if(e.sprite.y >= heights || e.erased){
                e.kill();
            }
            else{
                spritesnew.push(e);
            }
        });
        sprites = spritesnew;
        console.log(sprites);

        var tappersnew = [];
        tappers.forEach(function(e,i,a){
            e.alpha -= 0.1*(1.05 - e.alpha);
            e.scale.setTo(1.0+e.alpha, 1.0+e.alpha);
            if(e.alpha < 0.01){
                e.kill();
                console.log(t);
            }
            else{
                tappersnew.push(e);
            }
        });
        tappers = tappersnew;
    }

}

function mouseKeyActivate(tap){
    var lane = Math.round((tap.x-widths/4)/(widths/4));
    console.log(lane);
    if(lane == 0) keyActivate('z')();
    if(lane == 1) keyActivate('x')();
    if(lane == 2) keyActivate('c')();
}

function mouseActivate(key){
    /*
    var t = music.sound.currentTime + music.restart_off;

    var mousey = game.input.mousePointer.y;
    var dist = (((heights*5/6) - mousey)/(heights*2/3) * judge.frame);
    console.log(dist + t);

    var skip = false;

    sprites.forEach(function(e,i,a){
        var spritedist = (e.y-mousey)*(e.y-mousey) + (e.x-game.input.mousePointer.x)*(e.x-game.input.mousePointer.x);
        if(spritedist < 100){
            e.erased = true;
            skip = true;

            for(var i=0; i < beats.length; i++){
                var f = beats[i];
                console.log();
                if(Math.abs(f[0]-e.timing) < 0.1 && Math.abs(f[1]-e.lane) < 0.1 &&  Math.abs(f[2]-e.glyph) < 0.1){
                    console.log("match"+beats[i]);
                    beats.splice(i,1);
                    break;
                }
            }
        }
    });
    if(skip){
        sprites.forEach(function(e,i,a){
            e.kill();
        });
        sprites = [];

        beatpos = 0;
        while(beats[beatpos][0] < t-1000){
            beatpos += 1;
        }
        return;
    }

    var beat = game.add.sprite(game.world.centerX, 100, 'emoji');
    beat.anchor.setTo(0.5, 0.5);
    
    var nearest = Math.round(((dist + t)-music.offset)/music.period*2.0)*music.period/2.0 + music.offset;
    beat.timing = nearest;

    beat.lane = Math.round((game.input.mousePointer.x - (widths/4))/(widths/4));
    beat.glyph = 10;
    beat.x = (widths/4) + beat.lane*(widths/4);
    beat.frame = beat.glyph;
    sprites.push(beat);
    sprites.sort(function(a, b){
        return a.timing - b.timing;
    });

    beats.push([beat.timing, beat.lane, beat.glyph]);
    beats.sort(function(a, b){
        return a[0] - b[0];
    });
    console.log(beats);

    beatpos = 0;
    while(beats[beatpos][0] < t-1000){
        beatpos += 1;
    }*/
}


function keyActivate(key){
    return function(){
        if(key == 's' || key == 'd'){
            if(music.sound.isPlaying == true){
                music.pause();
            }
            var off = music.sound.currentTime + music.restart_off;
            var added = 0;

            if(key == 's'){
                added -= music.timing.period*2;
            }
            else if(key == 'd'){
                added += music.timing.period*2;
            }

            sprites.forEach(function(e,i,a){
                e.kill();
            });
            sprites = [];

            off += added;
            if(off < 0) off = 0;
            music.restart('', off/1000.0);
            music.restart_off = off;

            music.beatpos = 0;
            while(music.beatdata[music.beatpos][0] < off-1000){
                music.beatpos += 1;
            }

            return;
        }

        else if(key == 'a'){
            if(music.sound.isPlaying == true){
                music.sound.pause();
            }
            else{
                music.sound.resume();
            }
        }

        else if(key == 'v'){

            sprites.forEach(function(e,i,a){
                e.kill();
            });
            sprites = [];

            var off = (music.timing.offset);
            music.restart('', off/1000.0);
            music.restart_off = off;

            beatpos = 0;
            while(beats[beatpos][0] < off){
                beatpos += 1;
            }
            return;
        }

        var t = music.sound.currentTime + music.restart_off;

        sprites.forEach(function(e,i,a){
            if(e.sprite.frame == 46 || e.sprite.frame == 208){
            }
            else if(Math.abs(e.timing - t) > 300){
            }
            else if(Math.abs(e.timing - t) < judge.okwindow){
                var keymapper = {'z':0, 'x':1, 'c': 2};
                if(e.lane == keymapper[key]){
                    if(Math.abs(e.timing - t) < judge.perfectwindow){
                        /* perfect shot! */
                        e.kill();
                        judge.score += 100;
                        spritetap(e.lane, e.glyph);
                    }
                    else{
                        /* ok shot. */
                        e.kill();
                        judge.score += 50;
                        spritetap(e.lane, e.glyph);
                    }
                    console.log(judge.score);
                }
            }
        });
    }
}
function spritetap(lane, glyph){
    var tapper = game.add.sprite(game.world.centerX, 100, 'emoji');
    tapper.anchor.setTo(0.5, 0.5);
    tapper.x = (widths/4) + lane*(widths/4);
    tapper.y = (heights*5/6);
    tapper.scale.setTo(3.0, 3.0);
    tapper.frame = glyph;
    tappers.push(tapper);
}
