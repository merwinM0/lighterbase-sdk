interface BaseResponse {
    status?: number;
    message?: string;
    data?: Record<string, any>;
}
interface CreateSuccessResponse extends BaseResponse {
    id: string;
}
interface ViewSuccessResponse<T = Record<string, any>> extends BaseResponse {
    page: number;
    perPage: number;
    totalPages: number;
    totalItems: number;
    items: T[];
}
interface InsertPayload {
    [key: string]: any;
}
interface DeletePayload {
    WHERE: any;
}
interface UpdatePayload {
    set: Record<string, any>;
    WHERE: any;
}
interface SearchPayload {
    SELECT?: string[];
    WHERE?: any;
}
type TokenProvider = string | (() => string);
declare class LighterBase {
    private baseURL;
    private tokenProvider;
    constructor(baseURL: string, tokenProvider?: TokenProvider);
    private defaultBrowserToken;
    private getAuthToken;
    private request;
    insertTable(payload: InsertPayload, table: string): Promise<CreateSuccessResponse>;
    deleteTable(payload: DeletePayload, table: string): Promise<void>;
    updateTable(payload: UpdatePayload, table: string): Promise<void>;
    searchTable<T = Record<string, any>>(payload: SearchPayload, table: string, page: number, perPage: number): Promise<ViewSuccessResponse<T>>;
}

export { type BaseResponse, type CreateSuccessResponse, type DeletePayload, type InsertPayload, type SearchPayload, type TokenProvider, type UpdatePayload, type ViewSuccessResponse, LighterBase as default };
