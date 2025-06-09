import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { createScript, attrib } from "@/Configuration/createScriptDecorator";
import { Asset, Material, RenderComponent} from "playcanvas";
import { Players } from "@/Integration/Constants";
import { Board } from "../Board";  

@createScript()
export class Piece extends ScriptTypeBase {
    private selected: boolean = false;
    private originalMaterial: Material | null = null;
    private redMaterial: Material | null = null;

    player!: Players;

    protected board!: Board;
    protected boardPos!: { row: number; collum: number }; 

    setBoardContext(board: Board, pos: { row: number; collum: number }) {
        this.board = board;
        this.boardPos = { row: pos.row, collum: pos.collum};
    }

    canMove(target: { row: number; collum: number }): boolean {
        return false;
    }

    initialize() {

    }
    
    initializePiece(player: Players, material: Material) {
        this.player = player;
        this.originalMaterial = material;
        
        if(!this.redMaterial){
            this.redMaterial = this.app.assets.get(232562985)!.resource as Material;
        }
        this.applyPieceMaterial(material);
    }

    private applyPieceMaterial(material: Material) {
        const renders = this.entity.findComponents("render") as RenderComponent[];
        for (const rc of renders) {
            for (const mi of rc.meshInstances) {
                mi.material = material;
                mi.material.update();
            }
        }
    }

    select(){
        console.log(this.entity.name + " was selected");
        this.selected = true;

        if (this.redMaterial) this.applyPieceMaterial(this.redMaterial);
        this.board?.highlightPossibleMoves(this);
    }

     unselect() {

        console.log(this.entity.name + " was unselected");
        this.selected = false;

        if (this.originalMaterial) this.applyPieceMaterial(this.originalMaterial);
        this.board?.clearHighlights();
    }

    move(target: { row: number; collum: number }) {
    
        if (!this.canMove(target)) {
            console.log("this move is against the rules");
            this.unselect();
            return;
        }

        const targetPiece = this.board!.piecesMatrix[target.row][target.collum];

        if (targetPiece) {
            if (targetPiece.player === this.player) {
                this.unselect();
                return;
            }
            targetPiece.capture(); 
        }
       
        this.entity.setLocalPosition(target.collum * 2.25, 1.2, target.row * 2.25);
        this.board!.updatePieceMatrix(this, this.boardPos, target);
        this.boardPos.row= target.row;
        this.boardPos.collum =target.collum;

        this.unselect();
    }

    capture() {
        console.log(this.entity.name + "was captured");
        if (this.board) {
            this.board.updatePieceMatrix(this, this.boardPos, this.boardPos); 
        }
        this.entity.destroy();
    }

    isSelected(): boolean {
        return this.selected;
    }
}
