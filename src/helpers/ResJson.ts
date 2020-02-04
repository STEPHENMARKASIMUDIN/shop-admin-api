export type ResponseJson = {
  ResponseCode: number,
  ResponseMessage: string,
  Seller_List?: any,
  result?: any,
  body?: any,
  loginData?: any
}

export default function ResJson(Code: number, Msg: string): ResponseJson {
  return { ResponseCode: Code, ResponseMessage: Msg }
}