<?php
class RpcController extends Zend_Controller_Action {
	public function smdAction(){
		$class = 'Desktop_RPC_' . $this->_getParam('class');
		$server = new Zend_Json_Server();
		$server->getServiceMap()->setDojoCompatible(true);
		$server->getServiceMap()->setTransport('POST')
		 ->setTarget($this->getHelper('url')->url(array('controller'=>'rpc', 'action'=>'service')))
		 ->setId($this->getHelper('url')->url(array('controller'=>'rpc', 'action'=>'service')));
		$server->setClass($class);
		$smd = $server->getServiceMap();
		$this->view->data = $server->getServiceMap()->toJson();
		$this->render('service');
	}
	public function serviceAction(){
		$class = 'Desktop_RPC_' . $this->_getParam('class');
		$server = new Zend_Json_Server();
		$server->setClass($class);
		$server->setAutoEmitResponse(true);
		$server->handle();
	}
}