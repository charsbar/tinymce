import { Future, Option } from '@ephox/katamari';
import * as JsonResponse from './JsonResponse';
import { ResponseBodyDataTypes } from './HttpData';
import { XMLHttpRequest } from '@ephox/dom-globals';
import { HttpError } from './HttpError';
import { DataType } from './DataType';
import { readBlobAsText } from './BlobReader';

// can't get responseText of a blob, throws a DomException. Need to use FileReader.
// request.response can be null if the server provided no content in the error response.
const getBlobError = (request: XMLHttpRequest) => Option.from(request.response).map(readBlobAsText).getOr(Future.pure('no response content'));

const fallback = (request: XMLHttpRequest) => Future.pure(request.response);

const getResponseText = (responseType: ResponseBodyDataTypes, request: XMLHttpRequest) => {
  // for errors, the responseText is json if it can be, fallback if it can't
  switch (responseType) {
    case DataType.JSON: return JsonResponse.create(request.response).fold(() => fallback(request), Future.pure);
    case DataType.Blob: return getBlobError(request);
    case DataType.Text: return fallback(request);
    default: return fallback(request);
  }
};

export const handle = (url: string, responseType: ResponseBodyDataTypes, request: XMLHttpRequest): Future<HttpError> => {
  return getResponseText(responseType, request).map((responseText) => {
    const message = request.status === 0 ? 'Unknown HTTP error (possible cross-domain request)' :  `Could not load url ${url}: ${request.statusText}`;
    return {
      message,
      status: request.status,
      responseText
    };
  });
};