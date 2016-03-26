#!/usr/bin/python

import cgi, cgitb 
import sys, json
form = cgi.FieldStorage()

if form:
    print 'Content-Type: text/html'
    print
    print "wiped"
    f = open('./song.json', 'w')
    f.write(form.getfirst('a').replace('],','],\n'))
    f.close()
else:
    print 'Content-Type: text/html'
    print
    print """
    <!DOCTYPE html>
    <html>
    <head>
    <title></title>
    <script src="http://code.jquery.com/jquery-1.11.3.min.js"></script>
    <body>
    <button>wipe</button>
    <script type="text/javascript">
        $("button").click(function(){
            $.ajax({
                url: "",
                type: "post",
                datatype: "html",
                data: {a: "wipe"},
            }).done(function(data){
                alert(data);    
            });
        });
    </script>
    </body>
    </html>
    """