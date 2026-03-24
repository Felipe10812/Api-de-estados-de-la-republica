import { InformacionPostal, IUbicacionRepository } from "../interfaces/ubicacion.interface.js";

export class UbicacionService {
    constructor(private readonly repository: IUbicacionRepository) { }

    async obtenerEstados(): Promise<string[]> {
        return await this.repository.obtenerEstados();
    }

    async obtenerMunicipios(estado: string): Promise<string[] | null> {
        return await this.repository.obtenerMunicipios(estado);
    }

    async obtenerColoniasPorCP(cp: string): Promise<InformacionPostal | null> {
        return await this.repository.obtenerColoniasPorCP(cp);
    }

    async obtenerEstadosConMunicipios(): Promise<{ estado: string; municipios: string[] }[]> {
        return await this.repository.obtenerEstadosConMunicipios();
    }
}
