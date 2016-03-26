"use strict";

/* singletons */

var originalLoadComplete = loadComplete;
loadComplete = function(){
    originalLoadComplete();
    key.g = game.input.keyboard.addKey(Phaser.Keyboard.G);
    key.g.onDown.add(saveJSON);
}

function saveJSON(){
    var json = {
        offset: music.offset,
        period: music.period,
        beatlist: beatlist.beatlist,
    }
    console.log(json);
    $.ajax({
        url: '/cgi-bin/dev.py',
        traditional: true,
        method: 'POST',
        data: {'a': JSON.stringify(json)},
        dataType: 'json',

    });
}

function mouseActivate(key){

    var t = music.t;
    var skip = false;
    var mousey = game.input.mousePointer.y;
    var dist = (((heights*5/6) - mousey)/(heights*5/6) * judge.frame);
    console.log(dist);

    beatlist.beats.forEach(function(e,i,a){
        var beatdist = (e.y-mousey)*(e.y-mousey) + (e.x-game.input.mousePointer.x)*(e.x-game.input.mousePointer.x);
        console.log(beatdist);
        if(beatdist < 100){
            console.log("attatatta");
            e.erased = true;
            skip = true;

            for(var i=0; i < beatlist.beatlist.length; i++){
                var f = beatlist.beatlist[i];
                console.log();
                if(Math.abs(f[0]-e.timing) < 0.1 && Math.abs(f[1]-e.lane) < 0.1){
                    beatlist.beatlist.splice(i,1);
                    break;
                }
            }
        }
    });
    if(skip){
        beatlist.killall();
        beatlist.pos = 0;
        while(beatlist.beatlist[beatlist.pos][0] < music.restart_off-1000){
            beatlist.pos += 1;
        }
        return;
    }


    var nearest = Math.round(((dist + t)-music.offset)/music.period*4.0)*music.period/4.0 + music.offset;
    var lane = Math.round((game.input.mousePointer.x - (widths/6))/(widths/6));
    var beat = beatlist.makebeat([nearest, lane, 10]);
    console.log(lane);

    beatlist.beats.push(beat);
    beatlist.beats.sort(function(a, b){
        return a.timing - b.timing;
    });

    beatlist.beatlist.push([beat.timing, beat.lane, beat.glyph]);
    beatlist.beatlist.sort(function(a, b){
        return a[0] - b[0];
    });
    /*
    beatpos = 0;
    while(beats[beatpos][0] < t-1000){
        beatpos += 1;
    }*/
}