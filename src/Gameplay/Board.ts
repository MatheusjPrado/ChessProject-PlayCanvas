import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { attrib, createScript } from "@/Configuration/createScriptDecorator";
import { Asset, CameraComponent, Entity, Material, ScriptComponent, Vec3 } from "playcanvas";
import { Piece } from "./Pieces/Piece";
import { Pawn } from "./Pieces/Pawn";
import { Bishop } from "./Pieces/Bishop";
import { Players } from "@/Integration/Constants";
import { BoardTile } from "./BoardTile";
import { Player } from "./Player";


type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";


@createScript()
export class Board extends ScriptTypeBase {

    @attrib({
        title: "square Prefab",
        type: "asset",
        description: "square entity asset"
    }) square: Asset;

    @attrib({
        title: "white piece material",
        type: "asset",
        description: "white piece material"
    }) pieceWhiteMaterial: Asset;

    @attrib({
        title: "Piece Black Material",
        type: "asset",
        description: "Material para peças pretas"
    }) pieceBlackMaterial: Asset;

    @attrib({
        title: "King Prefab",
        type: "asset"
    }) king: Asset;

    @attrib({
        title: "Queen Prefab",
        type: "asset"
    }) queen: Asset;

    @attrib({
        title: "Rook Prefab",
        type: "asset"
    }) rook: Asset;

    @attrib({
        title: "Bishop Prefab",
        type: "asset"
    }) bishop: Asset;

    @attrib({
        title: "Knight Prefab",
        type: "asset"
    }) knight: Asset;

    @attrib({
        title: "Pawn Prefab",
        type: "asset"
    }) pawn!: Asset;

    @attrib({
        title: "Camera White",
        type: "entity"
    }) cameraWhite: Entity;

    @attrib({
        title: "Camera Black",
        type: "entity"
    }) cameraBlack: Entity;
    

    squares: Entity[][] = [];
    selectedPiece: Piece | null = null;
    piecesMatrix: (Piece | null)[][] = [];
    private highlightMat!: Material;
    private selectedTileMat!: Material;
    turn:Players=Players.White;


    initialize() {
        const size = 2.25;
        const cols = 8;
        const rows = 8;

        this.selectedTileMat = this.app.assets.get(235058620)!.resource as Material;
        this.highlightMat=this.app.assets.get(233765820)!.resource as Material;

        for (let i = 0; i < cols; i++) {
            this.squares[i] = [];
            this.piecesMatrix[i] = [];     
               
            for (let j = 0; j < rows; j++) {
                const square = this.square.resource.instantiate() as Entity;
                const squareScript = square.getScript(BoardTile);
                this.entity.addChild(square);
                squareScript?.initializeTile({ row: i, collum: j }, size);
                this.squares[i][j] = square;
                this.piecesMatrix[i][j] = null; 
            }
        }

        this.spawnPieces(size);

        this.cameraWhite.enabled = true;
        this.cameraBlack.enabled = false;
        this.turn = Players.White;
        this.setPlayerCamera(this.cameraWhite); 

    }

    // o record pega o tipo da peça, sua cor e numero
    private spawnPieces(size: number) {
        const setup: Record<PieceType, { whiteColor: [number, number][], black: [number, number][] }> = {
            king: { whiteColor: [[4, 0]], black: [[4, 7]] },
            queen: { whiteColor: [[3, 0]], black: [[3, 7]] },
            rook: { whiteColor: [[0, 0], [7, 0]], black: [[0, 7], [7, 7]] },
            bishop: { whiteColor: [[2, 0], [5, 0]], black: [[2, 7], [5, 7]] },
            knight: { whiteColor: [[1, 0], [6, 0]], black: [[1, 7], [6, 7]] },
            pawn: {
                whiteColor: Array.from({ length: 8 }, (_, i) => [i, 1]),
                black: Array.from({ length: 8 }, (_, i) => [i, 6])
            },
        };

        (Object.keys(setup) as PieceType[]).forEach(type => {
            setup[type].whiteColor.forEach(([i, j]) =>
                this.createPiece(type, Players.White, i, j, size)
            );
            setup[type].black.forEach(([i, j]) =>
                this.createPiece(type, Players.Black, i, j, size)
            );
        });
    }

    private createPiece(
        type: PieceType,
        player: Players,
        col: number,
        row: number,
        size: number
    ) {
        const asset: Asset = (this as any)[type];
        const pieceEntity = asset.resource.instantiate() as Entity;

        let mat: Material;

        if(player === Players.White) mat = this.pieceWhiteMaterial.resource;
        else mat = this.pieceBlackMaterial.resource;
        
        const pieceScript = pieceEntity.getScript(Piece);
        pieceScript?.initializePiece(player, mat);

        if (player === Players.White) pieceEntity.setEulerAngles(0, 180, 0);

        this.piecesMatrix[row][col] = pieceScript!;
        pieceScript?.setBoardContext(this, { row, collum: col });

        this.entity.addChild(pieceEntity);
        pieceEntity.setLocalPosition(col * size, 1.2, row * size);

    }

    updatePieceMatrix(piece: Piece, from: { row: number; collum: number }, to: { row: number; collum: number }) {

        this.piecesMatrix[from.row][from.collum] = null;
        this.piecesMatrix[to.row][to.collum]   = piece;

        const printar = this.piecesMatrix.map(row =>
            row.map(p => (p ? p.entity.name.slice(0, 2) : "--")) // I did with if else and it was a mess, so ugly :(
        );
        console.table(printar); 

    }

    highlightPossibleMoves(piece: Piece){

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const tile = this.squares[r][c].getScript(BoardTile);
                if (!tile) continue;

                const pos = piece.getBoardPos();
                if (r === pos.row && c === pos.collum) {
                    tile.setHighlight(true, this.selectedTileMat);
                } else if (piece.canMove({ row: r, collum: c })) {
                    tile.setHighlight(true, this.highlightMat);
                } else {
                    tile.setHighlight(false);
                }
            }
        }
    }


    clearHighlights() {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                this.squares[r][c].getScript(BoardTile)?.setHighlight(false);
            }
        }
    }

    isPlayerTurn(p:Players){

        return p===this.turn;

    }


    private setPlayerCamera(camEnt: Entity) {

        const playerEntity = this.app.root.findByName("Player") as Entity | null;

        if (!playerEntity) console.log("aaaaaaaaa")

        const sc = (playerEntity as any).script;
        const playerScript = (sc?.player ?? sc?.Player) as Player | undefined;

        if (playerScript) playerScript.cameraEntity = camEnt;
    }


    nextTurn () {

        this.turn = this.turn === Players.White ? Players.Black : Players.White;

        const activeCam: Entity = this.turn === Players.White? this.cameraWhite:this.cameraBlack;

        this.cameraWhite.enabled = activeCam === this.cameraWhite;
        this.cameraBlack.enabled = activeCam === this.cameraBlack;

        this.setPlayerCamera(activeCam);
    }


    // onSquareClick(square: Entity) {
    //     if (this.selectedPiece) {

    //         const targetPosition = square.getPosition().clone();
    //         targetPosition.y = 1.2; // isso é a altura q a peça vai ficar qnd mexida
    //         this.selectedPiece.move(targetPosition);
    //         this.selectedPiece = null;
    //     }
    // }

    update(dt: number) {

    }
}
