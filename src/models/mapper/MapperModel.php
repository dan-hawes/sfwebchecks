<?php

namespace models\mapper;

use libraries\palaso\CodeGuard;

class MapperModel
{
	/**
	 * 
	 * @var MongoMapper
	 */
	protected $_mapper;
	
	/**
	 * 
	 * @var \DateTime
	 */
	public $dateModified;
	
	/**
	 * 
	 * @var \DateTime
	 */
	public $dateCreated;

	/**
	 * 
	 * @param MongoMapper $mapper
	 * @param string $id
	 */
	protected function __construct($mapper, $id = '') {
		$this->_mapper = $mapper;
		$this->dateModified = new \DateTime();
		$this->dateCreated = new \DateTime();
		CodeGuard::checkTypeAndThrow($id, 'string');
		if (!empty($id)) {
			$this->read($id);
		}
	}
	
	/**
	 * Reads the model from the mongo collection
	 * @param string $id
	 * @see MongoMapper::read()
	 */
	public function read($id) {
		return $this->_mapper->read($this, $id);
	}
	
	/**
	 * 
	 * @param string $property
	 * @param string $value
	 * @return boolean
	 */
	public function readByProperty($property, $value) {
		return $this->_mapper->readByProperty($this, $property, $value);
	}
	
	/**
	 * Writes the model to the mongo collection
	 * @return string The unique id of the object written
	 * @see MongoMapper::write()
	 */
	public function write() {
		CodeGuard::checkTypeAndThrow($this->id, 'models\mapper\Id');
		$this->dateModified = new \DateTime();
		if (Id::isEmpty($this->id)) {
			$this->dateCreated = new \DateTime();
		}
		$this->id->id = $this->_mapper->write($this, $this->id->id);
		return $this->id->id;
	}
	
	/**
	 * returns true if the Id exists in the collection, false otherwise 
	 * @param string $id
	 * @return bool
	 */
	public function exists($id) {
		$idExists = $this->_mapper->exists($id);
		return $idExists;
	}

	/**
	 * Returns the database name
	 * @return string
	 */
	public function databaseName() {
		return $this->_mapper->databaseName();
	}
}

?>