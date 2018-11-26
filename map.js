//Starting Map Class - This class will create a new Hero and keep track of him and his
// stats. Some of the functions in this map class will call functions in the hero class.
// This map class will communicate extensively with the hero class.

var game_map;
var text;

//map class constructor
function Map(width, height, starting_x, starting_y, starting_energy, starting_whiffles) {
    //default constructor
    if(width === undefined){
        //This creates a new hero, and passes the hero constructor the parameters
        this.hero = new Hero(0, 0, 10000,10000, false);
        this.width = 25;
        this.height = 25;
        this.diamond_x = 2;
        this.diamond_y = 2;
        this.cells = [[]];
        for (var i = 0; i < this.width; ++i) {
            this.cells[i] = [];
            for (var j = 0; j < this.height; ++j) {
                this.cells[i][j] = new mapCell();
            }
        }
        this.place_chests()
        this.cells[this.diamond_x][this.diamond_y].object = "Royal Diamonds";
        return;
    }
    //copy constructor
    if(height === undefined ){
        var state = width;
        this.hero = new Hero(state.hero.x, state.hero.y, state.hero.energy, state.hero.whiffles, state.hero.binoculars);
        this.width = state.width;
        this.height = state.height;
        this.diamond_x = state.diamond_x;
        this.diamond_y = state.diamond_y;
        this.cells = state.cells;
        this.cells[this.diamond_x][this.diamond_y].object = "Royal Diamonds";
        return;
    }
    else{
        //This creates a new hero, and passes the hero constructor the parameters
        this.hero = new Hero(starting_x, starting_y, starting_energy, starting_whiffles, false);
        this.width = parseInt(width);
        this.height = parseInt(height);
        this.diamond_x = 2;
        this.diamond_y = 2;
        this.cells = [[]];
        for (var i = 0; i < this.width; ++i) {
            this.cells[i] = [];
            for (var j = 0; j < this.height; ++j) {
                this.cells[i][j] = new mapCell();
            }
        }
        this.place_chests()
        this.cells[this.diamond_x][this.diamond_y].object = "Royal Diamonds";
        return;
    }
}



//Member Functions:

//These functions move the hero.  They call the hero's move functions, and they
// check to see if the hero needs to wrap to the other side of the map.

//MOVE NORTH
Map.prototype.move_north = function()
{
    this.move(0,1);
};

// MOVE SOUTH
Map.prototype.move_south = function()
{
    this.move(0,-1);
};

//MOVE EAST
Map.prototype.move_east = function()
{
    this.move(1,0);
};

// MOVE WEST
Map.prototype.move_west = function()
{
    this.move(-1,0);
};


Map.prototype.move = function(x,y)
{
    nextx = (this.hero.x + x) % this.width;
    nexty = (this.hero.y + y) % this.height;
    if(nextx < 0)
        nextx = this.width -1;
    if(nexty < 0)
        nexty = this.height -1;
    if ( !this.isWater(nextx, nexty) ){
        this.hero.x = nextx;
        this.hero.y = nexty;
    }
    //update balances if hero PURCHASES a POWER BAR
    if(this.cells[this.hero.x][this.hero.y].object === "Power Bar") {
        this.powerBar();
    }
    // Check for binoculars
    if(this.cells[this.hero.x][this.hero.y].object === "Binoculars") {
        this.binoculars();
    }

    // Compare hero's current cell terrain with bog value
    // and calls update hero stats tp deduct energy by 2
    if(this.cells[this.hero.x][this.hero.y].terrain === 4) {
        this.hero.update_energy(-2);
    }
    else{
        //update energy for one step
        this.hero.update_energy(-1);
    }

    this.isObstacle();
    //Update the Map.
    this.update();
};

// checking if the cell contains water
Map.prototype.isWater = function(x,y)
{
    return this.cells[x][y].terrain === 2;
};


//checking for obstacle then removing said obstacle and decrementing hero's energy
Map.prototype.isObstacle = function()
{
    let currentObject = this.cells[this.hero.x][this.hero.y].object;
    if(currentObject === "Tree")
    {
        this.hero.energy -= 10;
        this.cells[this.hero.x][this.hero.y].object = "None";
    }
    else if(currentObject === "Boulder")
    {
        this.hero.energy -= 16;
        this.cells[this.hero.x][this.hero.y].object = "None";
    }
    else if(currentObject === "BlackBerry Bushes")
    {
        this.hero.energy -= 4;
        this.cells[this.hero.x][this.hero.y].object = "None";
    }
    if(this.hero.energy <= 0)
        this.player_lost();
};

//This function will be called when the player has won the game.  It
// will do an end-game sequence.
Map.prototype.player_won = function()
{
    window.location.replace("win.html");
    localStorage.clear();
};


//This function will be called when the player has lost the game.  It
// will do an end-game sequence.
Map.prototype.player_lost = function()
{
    window.location.replace("lose.html");
    localStorage.clear();
};



//  update the web page's information with the current information about the hero.
//  It will also update the map's visibility.
Map.prototype.update = function()
{
    var view_distance = 1;
    if(this.hero.binoculars) {
        view_distance = 2;
    }
    //Update the map to set the tiles around the hero to be visible:
    var start_i = this.hero.x - view_distance;
    if (start_i < 0) {
        start_i = 0;
    }
    var start_j = this.hero.y-view_distance;
    if (start_j < 0) {
        start_j = 0;
    }
    for (var i = start_i; (i <= this.hero.x + view_distance) && (i < this.width); ++i) {
        for (var j = start_j; (j <= this.hero.y + view_distance) && (j < this.height); ++j) {
            this.cells[i][j].isVisible = true;
        }
    }
    //Update the map displayed on the page:
    document.getElementById("map_box").innerHTML = this.map_string();

    // Update the game state information displayed on the page:
    document.getElementById("location").value  = this.hero.display_location();
    document.getElementById("energy").value  = this.hero.display_energy();
    document.getElementById("whiffles").value  = this.hero.display_whiffles();
    document.getElementById("message").value  = message(this.hero, this.cells[this.hero.x][this.hero.y]);
    localStorage.setItem('map', JSON.stringify(game_map) );
    //check chests
    if(this.cells[this.hero.x][this.hero.y].object == "Chest 1"){
        this.hero.update_whiffles(100);
        this.cells[this.hero.x][this.hero.y].object = "None";
    }

    if(this.cells[this.hero.x][this.hero.y].object == "Chest 2"){
        this.hero.whiffles = 0;
        this.cells[this.hero.x][this.hero.y].object = "None";
    }

    //check diamonds
    if ((this.hero.x === this.diamond_x) && (this.hero.y === this.diamond_y))
        this.player_won();

    //check energy level
    if (this.hero.energy <= 0)
        this.player_lost();
};

// Places a number of treasure chests on the map cells randomly
Map.prototype.place_chests = function(){
  //chests in the lower left corner for testing
    this.cells[0][1].object = "Chest 1";
    this.cells[0][2].object = "Chest 2";
    var amount = 5;
    var x, y, type;
    for (var i = 0; i < amount; ++i){
        x = Math.floor(Math.random() * this.width);
        y = Math.floor(Math.random() * this.height);
        type = Math.floor(Math.random() * 2);
        if (type == 1){
          this.cells[x][y].object = "Chest 1";
        }
        else{
          this.cells[x][y].object = "Chest 2";
        }
    }
}

// Formats the map array as the contents of an HTML table.
Map.prototype.map_string = function() {
    result = "";
    for (var j = this.height-1; j >= 0; --j) {
        for (var i = 0; i < this.width; ++i) {
            var cell = this.cells[i][j];
            if (j === this.hero.y && i === this.hero.x) {
                result += "<b>@</b>";
            } else if(cell.isVisible) {
                switch(cell.object) {
                    case "Tree":
                        // Tree
                        result += "T";
                        break;
                    case "Boulder":
                        // Rock
                        result += "R";
                        break;
                    case "Blackberry Bushes":
                        // Bushes
                        result += "B";
                        break;
                    case "Binoculars":
                        // Binoculars = "Field Glasses"
                        result += "F";
                        break;
                    case "Royal Diamonds":
                        // Diamonds
                        result += "<span style=\"color:blue;\">D</span>";
                        break;
                    case "Chest 1":
                        //chest type 1
                        result += "<span style=\"color:orange;\">C</span>";
                        break;
                    case "Chest 2":
                        //chest type 2 looks the same as 1
                        result += "<span style=\"color:orange;\">C</span>";
                        break;
                    case "Power Bar":
                        // Power Bar
                        result += "P";
                        break;
                    case "None":
                        switch(cell.terrain) {
                            case 0:
                                // Meadow
                                result += "-";
                                break;
                            case 1:
                                // Forest
                                result += ";";
                                break;
                            case 2:
                                // Water
                                result += "~";
                                break;
                            case 3:
                                // Wall
                                result += "#";
                                break;
                            case 4:
                                // Bog
                                result += ",";
                                break;
                            case 5:
                                // Swamp
                                result += "%";
                                break;
                            default:
                                result += "?";
                                break;
                        }
                        break;
                    default:
                        result += "?";
                        break;
                }
            } else {
                result += " ";
            }
        }
        result += "<br>";
    }
    return result;
}


Map.prototype.powerBar = function ()
{
    //prompt user
    var result = window.confirm("Would You like to purchase a POWER BAR for 1 Whiffle?");
    if (result){
        //if purchased, remove from mapCell
        this.cells[this.hero.x][this.hero.y].object = "None";
        this.hero.update_energy(20);
        this.hero.update_whiffles(-1);
    }
}

Map.prototype.binoculars = function ()
{
    //prompt user
    var result = window.confirm("Would You like to purchase a pair of BINOCULARS for 50 Whiffle?");
    if (result){
        //if purchased, remove from mapCell
        this.cells[this.hero.x][this.hero.y].object = "None";
        this.hero.binoculars = true;
        this.hero.update_whiffles(-50);
    }
}
