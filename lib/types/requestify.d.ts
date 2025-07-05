declare module 'requestify' {
  interface RequestifyResponse {
    getBody(): any;
    getCode(): number;
  }

  interface RequestifyOptions {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
    dataType?: string;
  }

  function requestify(url: string, options?: RequestifyOptions): Promise<RequestifyResponse>;
  export default requestify;
} 