export interface User {
    id:number,
    username:string,
    email:string,
    profile_image:string,
    password:string,
    role:string,
    registration_date:Date,
    verified:boolean,
    verification_token:string,
    novapoints:number,
    is_banned:boolean,
    unban_date:Date,
}