import axios from "axios";
import {config} from "dotenv";

config();

const auth_bearer = process.env.AUTH_BEARER
const ip_checker_url = process.env.IP_CHECKER_URL
const cloudflare_base_zones_api = process.env.CLOUDFLARE_BASE_ZONES_API
const dns_zone = process.env.DNS_ZONE
const domain = process.env.DOMAIN
const record_type = process.env.RECORD_TYPE
const record_to_update = process.env.RECORD_TO_UPDATE
const proxied = process.env.PROXIED === 'true'

const cloudflare_base_url = `${cloudflare_base_zones_api}${dns_zone}`


const cloudflare_config = {
    headers: {
        Authorization: `${auth_bearer}`,
        "Content-Type": "application/json"
    }
}

const ip = (await axios.get(`${ip_checker_url}`)).data["ip"]

const dns_list = ((await axios.get(`${cloudflare_base_url}/dns_records?type=${record_type}&name=${record_to_update}.${domain}`, cloudflare_config)).data.result)

if (dns_list.length > 1) {
    throw "More than one DNS record found."
}

axios.patch(`${cloudflare_base_url}/dns_records/${dns_list[0].id}`,
    {
        "type": record_type,
        "name": record_to_update,
        "content": ip,
        "ttl": 1, // 1 = auto, 60+s otherwise
        "proxied": proxied
    }, cloudflare_config)
    .then(console.log)