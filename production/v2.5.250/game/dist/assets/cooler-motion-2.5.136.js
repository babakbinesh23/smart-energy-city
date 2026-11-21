// Restore only outlet air and mechanical drive; cabinet and water stay stable.
export function keepCoolerDrive101(clip,root){
 const airNames=new Set();root?.traverse(node=>{if(node.userData?.airflow)node.traverse(child=>airNames.add(child.name));});
 clip.tracks=clip.tracks.filter(track=>/^(DRIVE_FAN_AND_MAIN_PULLEY|DRIVE_MOTOR_SHAFT_AND_PULLEY)\.quaternion$/.test(track.name)||airNames.has(track.name.split('.')[0]));
 return clip;
}
