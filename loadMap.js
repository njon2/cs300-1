
var game_map;

var openFile = function(event){
    var input = event.target;

    var reader = new FileReader();
    reader.onload = function(){
        var text = reader.result;
        dimensions(text);
    }
    reader.readAsText(input.files[0]);
}

function dimensions(file){
    var pattern = /[0-9]+/;
    var result = pattern.exec(file);
    alert("dimensions = " + result);
    var str = file.substr(result.index + result[0].length, file.length);
    if(result)
        playerLocation(str, result);
    else
        alert("invalid file");
}

function playerLocation(file, dim){
    //x position
    var pattern = /[0-9]+/;
    var x = pattern.exec(file);
    var str = file.substr(x.index + x[0].length, file.length);
    alert("x coordinate = " + x);

    //y position
    var y = pattern.exec(str);
    str = str.substr(y.index + y[0].length, str.length);
    alert("y coordinate = " + y);

    //energy
    var energy = pattern.exec(str);
    str = str.substr(energy.index + energy[0].length, file.length);
    alert("energy = " + energy);

    //whiffles
    var whiffles = pattern.exec(str);
    str = str.substr(whiffles.index + whiffles[0].length, str.length);
    alert("whiffles = " + whiffles);

    game_map = new Map(dim, dim, x, y, whiffles, energy);

    parseInventory(str);
}

function parseInventory(file){
    var pattern = /[A-z ]+/;
    var result = pattern.exec(file);
    str = file.substr(result.index + result[0].length, file.length);
    alert("item = " + result);
    if(str[3] === '#')
        parseCell(str);
    else
        parseInventory(str);
}

function parseCell(file){
    //x position
    var pattern = /[0-9]+/;
    var x = pattern.exec(file);
    var str = file.substr(x.index + x[0].length, file.length);
    alert("x coordinate = " + x);

    //y position
    var y = pattern.exec(str);
    str = str.substr(y.index + y[0].length, str.length);
    alert("y coordinate = " + y);

    //visibility
    pattern = /[0-1]/;
    var visible = pattern.exec(str);
    str = str.substr(visible.index + visible[0].length, str.length);
    alert("visible = " + visible);

    //terrain id
    pattern = /[0-9]+/;
    var terrain = pattern.exec(str);
    str = str.substr(terrain.index + terrain[0].length, str.length);
    alert("terrain id = " + terrain);

    //content string
    pattern = /[A-z ]+/;
    var content = pattern.exec(file);
    str = file.substr(content.index + content[0].length, str.length);
    alert("content string = " + content);

    if(isNaN(x))
        return;
    game_map.cells[x][y] = new mapCell(x, y, visible, terrain, content);
    parseCell(str);
}

