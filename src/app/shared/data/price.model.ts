import { Modality } from "./modality.interface";

export class Price {
    modality: Modality;
    price: number;

    constructor(modality: Modality, price: number) {
        this.modality = modality;
        this.price = price;
    }
}
