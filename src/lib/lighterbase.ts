export interface BaseResponse {
  status?: number;
  message?: string;
  data?: Record<string, any>;
}

export interface CreateSuccessResponse extends BaseResponse {
  id: string;
}

export interface ViewSuccessResponse<T = Record<string, any>> extends BaseResponse {
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
  items: T[];
}

export interface InsertPayload {
  [key: string]: any;
}

export interface DeletePayload {
  WHERE: any;
}

export interface UpdatePayload {
  set: Record<string, any>;
  WHERE: any;
}

export interface SearchPayload {
  SELECT?: string[];
  WHERE?: any;
}


export type TokenProvider = string | (() => string);


export default class LighterBase {
  private baseURL: string;
  private tokenProvider: TokenProvider;

  /**
   * @param baseURL      接口基地址
   * @param tokenProvider 可选：
   *                       - 字符串：固定 token
   *                       - 函数  ：每次请求动态返回 token
   *                       - 不传  ：自动尝试读浏览器 cookie（authToken）
   */
  constructor(baseURL: string, tokenProvider?: TokenProvider) {
    if (!baseURL || typeof baseURL !== 'string') {
      throw new Error('Lighterbase 初始化失败：必须传入一个有效的基准 URL 字符串。');
    }
    this.baseURL = baseURL;
    this.tokenProvider = tokenProvider ?? this.defaultBrowserToken;
  }


  private defaultBrowserToken = (): string => {
    if (typeof document === 'undefined') return '';  
    const m = document.cookie.match(/authToken=([^;]*)/);
    if(m)
      if (m[1]) return m[1];
    return '';
  };


  private getAuthToken(): string {
    return typeof this.tokenProvider === 'function'
      ? this.tokenProvider()
      : this.tokenProvider;
  }


  private async request<T>(
    method: string,
    endpoint: string,
    payload?: any,
    skipAuth = false
  ): Promise<T> {
    try {
      const token = skipAuth ? '' : this.getAuthToken();
      const url = `${this.baseURL}/api/auto/${endpoint}`;
      const headers: HeadersInit = { 'Content-Type': 'application/json' };

      if (token) headers.Authorization = `Bearer ${token}`;

      const config: RequestInit = { method, headers };
      if (payload && method !== 'GET' && method !== 'DELETE') {
        config.body = JSON.stringify(payload);
      }

      const res = await fetch(url, config);
      if (!res.ok) {
        const err: BaseResponse = await res.json().catch(() => ({ message: '' }));
        throw new Error(err.message || `API 请求错误: 状态码 ${res.status}`);
      }
      if (res.status === 204) return null as unknown as T;
      return res.json();
    } catch (err) {
      console.error('Lighterbase 请求失败:', err);
      throw err;
    }
  }


  public async insertTable(
    payload: InsertPayload,
    table: string
  ): Promise<CreateSuccessResponse> {
    const skipAuth = table === 'users';
    return this.request<CreateSuccessResponse>('POST', `create/${table}`, payload, skipAuth);
  }

  public deleteTable(payload: DeletePayload, table: string): Promise<void> {
    return this.request<void>('DELETE', `delete/${table}`, payload);
  }

  public updateTable(payload: UpdatePayload, table: string): Promise<void> {
    return this.request<void>('PUT', `update/${table}`, payload);
  }

  public searchTable<T = Record<string, any>>(
    payload: SearchPayload,
    table: string,
    page: number,
    perPage: number
  ): Promise<ViewSuccessResponse<T>> {
    const endpoint = `view/${table}?page=${page}&perpage=${perPage}`;
    return this.request<ViewSuccessResponse<T>>('POST', endpoint, payload);
  }
}