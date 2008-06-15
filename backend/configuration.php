<?php
	return array(
		database => array(
			'adapter' => 'Mysqli',
            'params' => array(
				'host' => 'localhost',
                'dbname' => 'desktop',
                'username' => 'mysql',
                'password' => 'mysql'
            ),
			'prefix' => ''
		),
		configuration => array(
			'salt' => 'eb48d0b0ecf18eb30bcc9379068e3061',
			'public' => true,
			'crosstalkThrottle' => false
		)
	);
