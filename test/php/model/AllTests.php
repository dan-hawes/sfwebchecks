<?php
require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

class AllTests extends TestSuite {
	
    function __construct() {
        parent::__construct();
 		$this->addFile(TestPath . 'model/UserModel_Test.php');
 		$this->addFile(TestPath . 'model/ProjectModel_Test.php');
 		$this->addFile(TestPath . 'model/MultipleModel_Test.php');
    }

}

?>