import { Injectable } from "@nestjs/common";
import { console } from "inspector";




@Injectable()
export class ConfigService{

    getDataBaseConfig(){

        const nodeEnv = process.env.NODE_ENV
        console.log(nodeEnv);
        return {
            host:process.env.DB_USER,
            DATABASE_PASSWORD: process.env.DB_PASS,
            log_type : process.env.LOG_TYPE,
        };
    }

}