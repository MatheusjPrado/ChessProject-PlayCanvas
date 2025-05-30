import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { attrib, createScript } from "@/Configuration/createScriptDecorator";
import { Asset, Entity, Material, Vec3 } from "playcanvas";
import { Piece } from "./Pieces/Piece";
import { Pawn } from "./Pieces/Pawn";
import { Bishop } from "./Pieces/Bishop";
import { Players } from "@/Integration/Constants";
import { BoardTile } from "./BoardTile";

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

    squares: Entity[][] = [];
    selectedPiece: Piece | null = null;

    initialize() {
        const size = 2;
        const cols = 8;
        const rows = 8;

        for (let i = 0; i < cols; i++) {
            this.squares[i] = [];
            for (let j = 0; j < rows; j++) {
                const square = this.square.resource.instantiate() as Entity;
                const squareScript = square.getScript(BoardTile);
                this.entity.addChild(square);
                squareScript?.initializeTile({ row: i, collum: j }, size)
                this.squares[i][j] = square;
            }
        }


        this.spawnPieces(size);
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

        const mat: Material = player === Players.White ? this.pieceWhiteMaterial.resource : this.pieceBlackMaterial.resource;

        const pieceScript = pieceEntity.getScript(Piece);

        pieceScript?.initializePiece(player, mat);

        this.entity.addChild(pieceEntity);
        pieceEntity.setLocalPosition(col * size, 1.2, row * size);
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
