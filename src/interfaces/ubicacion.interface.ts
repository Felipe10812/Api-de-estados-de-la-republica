export interface InformacionPostal {
    estado: string;
    municipio: string;
    colonias: {
        nombre: string;
        tipo: string;
    }[];
}

export interface IUbicacionRepository {
    obtenerEstados(): Promise<string[]>;

    obtenerMunicipios(estado: string): Promise<string[] | null>;

    obtenerColoniasPorCP(cp: string): Promise<InformacionPostal | null>;

    obtenerColoniasPorMunicipio(municipio: string): Promise<InformacionPostal | null>;

    obtenerEstadosConMunicipios(): Promise<{ estado: string; municipios: string[] }[]>;
}
