// Release-to-arm and rising edges prevent a held button firing twice across
// scene handoff. A selects the pointed target; B toggles the city map.
export function pollOfficeButtons126(controller,states,actions){
 const pad=controller.inputSource?.gamepad;if(!pad)return;
 const current={trigger:!!pad.buttons[0]?.pressed,a:!!pad.buttons[4]?.pressed,b:!!pad.buttons[5]?.pressed},previous=states.get(controller)??{trigger:true,a:true,b:true};
 states.set(controller,current);
 const managed=controller.inputSource.handedness==='right'&&actions.b?.(controller.inputSource);
 if(!managed&&controller.inputSource.handedness==='right'&&current.b&&!previous.b)actions.map();
 if((current.trigger&&!previous.trigger)||(controller.inputSource.handedness==='right'&&current.a&&!previous.a))actions.select(controller.inputSource);
}
