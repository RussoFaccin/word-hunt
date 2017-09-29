export class WordHunt{
  gameBoard: any;
  svgCanvas: any;
  wordListContainer: any;
  blueprintPath: any;
  solution: any[] = [];
  currentLineIndex: number = 0;
  currentLine: any = null;
  boxWidth: number;
  boxHeight: number;
  realWidth: number;
  realHeight: number;
  radiusMatch: number;
  wordList: any[] = [];
  wordsLeft: number;
  constructor(selector: string, blueprintPath: string, wordListSelector: string){
    // Get Game Board
    this.gameBoard = document.querySelector(selector);

    if(this.gameBoard == null){
      console.error("Game Board Container not specified!");
    }

    // Get word List container
    this.wordListContainer = document.querySelector(wordListSelector);

    if(this.wordListContainer == null){
      console.error("Word List Container not specified!");
    }

    // Get SVG Canvas
    this.svgCanvas = document.querySelector("#svg-canvas");

    // Get Blueprint svg
    this.blueprintPath = blueprintPath;
    this.openBlueprint(blueprintPath);

    // Bind
    this.initLine = this.initLine.bind(this);
    this.moveLine = this.moveLine.bind(this);
    this.finishLine = this.finishLine.bind(this);

    // Add click event to SVG Canvas
    this.svgCanvas.addEventListener("mousedown", this.initLine);

    //Get canvas size
    let gameBoard = document.querySelector("#game-board");
    this.realWidth = gameBoard.getClientRects()[0].width;
    this.realHeight = gameBoard.getClientRects()[0].height;
  }

  private getViewBox(svgTarget){
    this.boxWidth = svgTarget.viewBox.baseVal.width;
    this.boxHeight = svgTarget.viewBox.baseVal.height;
    this.radiusMatch = this.boxWidth / 10;
  }

  private openBlueprint(file){
    let self = this;
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          let parser = new DOMParser();
          let xmlDoc = parser.parseFromString(this.responseText, "text/xml");
          let blueprint = xmlDoc.querySelector("svg");

          // Get viewBox
          self.getViewBox(blueprint);

          let lines = blueprint.querySelectorAll("line");
          self.mountSolution(lines);
          // callback(blueprint);
        }
    };
    xhttp.open("GET", file, true);
    xhttp.send();
  }

  private mountSolution(list){
    this.wordsLeft = list.length;
    console.log(this.wordsLeft);
    let self = this;
    list.forEach(function(item, index){
      let lineObject = {
        x1: item.x1.baseVal.value,
        x2: item.x2.baseVal.value,
        y1: item.y1.baseVal.value,
        y2: item.y2.baseVal.value
      }

      let wordObject: any = {
        word: item.id,
        active: true
      }

      self.wordList.push(wordObject);
      self.solution.push(lineObject);
    });

    // Mount Word List Container
    this.mountWordsList(this.wordList);
  }

  private initLine(evt){
    this.currentLineIndex += 1;
    let lineObject = {
      x1: evt.layerX,
      y1: evt.layerY,
      x2: evt.layerX,
      y2: evt.layerY
    };
    let lineContent = `<line data-index="${this.currentLineIndex}" x1="${lineObject.x1}" y1="${lineObject.y1}" x2="${lineObject.x2}" y2="${lineObject.y2}" fill="none" stroke="rgba(153, 217, 85, 0.5)" stroke-miterlimit="10" stroke-linecap="round" stroke-width="5%"/>`;
    this.svgCanvas.innerHTML += lineContent;
    this.currentLine = this.svgCanvas.querySelector(`line[data-index="${this.currentLineIndex}"]`);
    this.svgCanvas.addEventListener("mousemove", this.moveLine);
  }

  private moveLine(evt){
    this.currentLine.setAttribute("x2", evt.layerX);
    this.currentLine.setAttribute("y2", evt.layerY);
    this.svgCanvas.addEventListener("mouseup", this.finishLine);
  }

  private finishLine(evt){
    let self = this;

    this.svgCanvas.removeEventListener("mousemove", this.moveLine);

    let regularLine = {
      x1: (this.boxWidth / this.realWidth) * this.currentLine.x1.baseVal.value,
      y1: (this.boxHeight / this.realHeight) * this.currentLine.y1.baseVal.value,
      x2: (this.boxWidth / this.realWidth) * this.currentLine.x2.baseVal.value,
      y2: (this.boxHeight / this.realHeight) * this.currentLine.y2.baseVal.value
    };

    let inverseLine = {
      x1: (this.boxWidth / this.realWidth) * this.currentLine.x2.baseVal.value,
      y1: (this.boxHeight / this.realHeight) * this.currentLine.y2.baseVal.value,
      x2: (this.boxWidth / this.realWidth) * this.currentLine.x1.baseVal.value,
      y2: (this.boxHeight / this.realHeight) * this.currentLine.y1.baseVal.value
    };

    for(let i = 0; i<=this.solution.length; i++){
      let isMatchRegular = false;
      let isMatchInverse = false;
      isMatchRegular = self.testLines(regularLine, this.solution[i]);
      isMatchInverse = self.testLines(inverseLine, this.solution[i]);

      if(isMatchRegular || isMatchInverse){
        self.wordList[i].active = false;
        self.wordsLeft--;
        self.checkVictory(self.wordsLeft);
        self.currentLine.setAttribute("stroke-opacity", 1);
        break;
      }else{
        self.currentLine.setAttribute("stroke-opacity", 0);
      }
    }

    this.mountWordsList(this.wordList);
  }

  private testLines(lineObject_1: any, lineObject_2: any){
    let isMatch = false;

    let distanceP1 = this.distance(lineObject_1.x1, lineObject_1.y1, lineObject_2.x1, lineObject_2.y1);
    let distanceP2 = this.distance(lineObject_1.x2, lineObject_1.y2, lineObject_2.x2, lineObject_2.y2);

    if(distanceP1 <= this.radiusMatch && distanceP2 <= this.radiusMatch){
      isMatch = true;
    }
    return isMatch;
  }

  private distance(x1: number, y1: number, x2: number, y2: number){
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  private mountWordsList(wordList: any[]){
    let list = wordList;
    let listComponent = "";

    list.forEach(function(item, index){
      let activeClass = item.active? "active" : "disabled";
      listComponent += `<li class="${activeClass}">${item.word}</li>`;
    });

    this.wordListContainer.innerHTML = listComponent;
  }

  private checkVictory(words: number){
    if(words == 0){
      console.log("END GAME!!!");
    }
  }
}
