declare interface FetchOptionsType {
    method: MethodTypes;
    headers?: { [key: string]: string };
    body?: BodyInit | null;
}

declare type MethodTypes = 'GET' | 'DELETE' | 'POST';

declare interface ServerResponse {
    serverResponse: boolean;
    body: string | UserType;
}

// IMGBB API RESPONSE: https://api.imgbb.com

declare type ImgBBResponseType = {
    [key: string]: DataType;
};

declare type DataType = {
    url: string;
} & string;
