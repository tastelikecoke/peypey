"use strict";


function preload() {
}

function create() {
    /* loads the stage */
    game.stage.backgroundColor = 0x999999;

    game.load.onLoadStart.add(loadStart, this);
    game.load.onLoadComplete.add(loadComplete, this);

    console.log("Loading...");
    game.load.audio('tear', 'assets/tearrain.mp3');
    game.load.image('marisa', 'assets/marisa2.png');
    game.load.image('tewi', 'assets/tewi.png');
    game.load.image('load', 'assets/load.png');
    game.load.image('rem', 'assets/rem.png');
    game.load.image('line', 'assets/line.png');
    game.load.image('fall2', 'assets/fall2.png');
    game.load.spritesheet('emoji', 'assets/apple.png', 32, 32, 1681);
    game.load.text('song', 'assets/song.json');
    console.log("Loading done");

    text = game.add.text(game.world.centerX, game.world.centerY, '0');
    text.anchor.set(0.5);
    text.font = 'Verdana';
    text.fontSize = 36;
    text.fill = '#ffffff';
    text.text = "...";

    game.load.start();
}

function loadStart(){
    /* loads everything at the start */

    text.text = "Loading";
}

function loadComplete(){

    /* loads everything */
    beats = JSON.parse(game.cache.getText('song')).only;
    music = game.add.audio('tear');
    music.restart_off = 0;
    music.timing = {
        offset: 852.1,
        period: 468.75,
    }
    music.play();

    judge = {
        perfectwindow: 50,
        okwindow: 100,
        frame: (music.timing.period * 2),
        score: 0,
    }

    var marisa0 = game.add.sprite(0, 0, 'load');

    judge.scoretext = game.add.text(game.world.centerX, game.world.centerY, '0');
    judge.scoretext.anchor.set(0.5);
    judge.scoretext.font = 'Verdana';
    judge.scoretext.fontSize = 36;
    judge.scoretext.fill = '#ffffff';
    judge.scoretext.alpha = 1;

    var marisa2 = game.add.sprite(0, 0, 'marisa');
    var rem1 = game.add.sprite(0, 0, 'rem');
    var tewi = game.add.sprite(0, 0, 'tewi');
    var marisa1 = game.add.sprite(0, 0, 'marisa');
    slideshow.push(marisa1);
    slideshow.push(tewi);
    slideshow.push(rem1);
    slideshow.push(marisa2);

    scanline = game.add.sprite(widths/2, heights*5/6, 'fall2');
    scanline.anchor.setTo(0.5, 0.5);
    scanline.scale.setTo(320/800.0,320/800.0);


    var marisa4 = game.add.sprite(0, 0, 'load');
    slideshow.push(marisa4);


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
}

function mouseKeyActivate(tap){
    var lane = Math.round((tap.x-widths/4)/(widths/4));
    console.log(lane);
    if(lane == 0) keyActivate('z')();
    if(lane == 1) keyActivate('x')();
    if(lane == 2) keyActivate('c')();
}

function mouseActivate(key){
    var t = music.currentTime + music.restart_off;

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
    
    var nearest = Math.round(((dist + t)-music.timing.offset)/music.timing.period*2.0)*music.timing.period/2.0 + music.timing.offset;
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
    }
}


function keyActivate(key){
    return function(){
        if(key == 's' || key == 'd'){
            if(music.isPlaying == true){
                music.pause();
            }
            var off = music.currentTime + music.restart_off;
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

            beatpos = 0;
            while(beats[beatpos][0] < off-1000){
                beatpos += 1;
            }

            return;
        }

        else if(key == 'a'){
            if(music.isPlaying == true){
                music.pause();
            }
            else{
                music.resume();
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

        var t = music.currentTime + music.restart_off;

        sprites.forEach(function(e,i,a){
            if(e.frame == 46 || e.frame == 208){
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

function queueBeats(t){
    var beatslength = beats.length;

    while(beatpos != beatslength && beats[beatpos][0] - t <= 4000){
        var beat = game.add.sprite(game.world.centerX, 100, 'emoji');

        beat.inputEnabled = true;
        beat.anchor.setTo(0.5, 0.5);

        beat.timing = beats[beatpos][0];
        beat.lane = beats[beatpos][1];
        beat.glyph = beats[beatpos][2];
        beat.x = (widths/4) + beat.lane*(widths/4);
        beat.frame = beat.glyph;
        beat.erased = false;
        
        sprites.push(beat);
        beatpos += 1;
    }
}

function update(){
    var t = music.currentTime + music.restart_off;
    if(prevt >= t){
        t += game.time.physicsElapsed;
    }

    if (music.isDecoding){
        text.text = "Loading song."
        game.world.bringToTop(text);
    }
    else{
    }

    queueBeats(t);

    
    var linesnew = [];
    if(linecover < t+2000){
        linecover = Math.round((linecover-music.timing.offset)/music.timing.period)*music.timing.period + music.timing.offset;

        var line = game.add.sprite(game.world.centerX, 100, 'line');
        line.anchor.setTo(0.5, 0.5);
        line.timing = linecover;
        console.log(line.timing+" "+ music.timing.period);
        lines.push(line);
        linecover += music.timing.period;
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
        e.y = (heights*5/6) - ((e.timing - t)/judge.frame * (heights*5/6));

        if(t - e.timing >= 300){
            if(e.frame != 208 && e.frame != 46){
                e.frame = 86;
            }
        }

        if(e.y >= heights || e.erased){
            e.kill();
        }
        else{
            spritesnew.push(e);
        }
    });
    sprites = spritesnew;

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

    if(t > 10){
        slideshow[4].alpha *= 0.90;
    }
    if(t > 30852){
        slideshow[0].alpha *= 0.90;
    }
    if(t > 45852){
        slideshow[1].alpha *= 0.90;
    }
    if(t > 75852){
        slideshow[2].alpha *= 0.90;
    }
    if(t > 135148){
        judge.scoretext.text = "Score\n"+judge.score
        slideshow[3].alpha *= 0.90;
    }
    prevt = t;
}

function render() {
}