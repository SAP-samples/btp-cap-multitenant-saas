service GatewayService @(path : '/catalog/GatewayService', protocol: 'rest', requires: 'authenticated-user', impl: 'srv/gateway-service' ){
    function redirect() returns String; 
}