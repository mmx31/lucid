<?php

import("models.session");

class session_manager {
    var $session_id
    function open($save_path, $session_name){
        //do nothing
        return true;
    }
    function close(){
        if (!empty($this->fieldarray)) {
            // perform garbage collection
            $result = $this->gc(ini_get('session.gc_maxlifetime'));
            return $result;
        } // if
        
        return FALSE;
    }
    function __destruct(){
        @session_write_close();

    }
    function read($session_id){
        global $Session;
        $p=$Session->filter("session_id", $session_id);
        if($p != false){
            return $p[0]->session_data;
        }
        else{
            return '';
        }
    }
    function write($session_id, $session_data){
        
    }
}
