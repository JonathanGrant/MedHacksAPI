<?php
	$people = array('+16507993840' => 'Jonathan');

	if (!$name = $people[$_REQUEST['From']]) {
		$name = 'Monkey';
	}

	header('content-type: text/xml');
	echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
?>
<Response>
	<Sms>Hello <?php echo $name;?></Sms>
</Response>