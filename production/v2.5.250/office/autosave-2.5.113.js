/* One serial queue for committed admin edits; never overwrite a conflicting revision. */
(()=>{'use strict';
 if(globalThis.BarghetoCommitSave113)return;
 globalThis.BarghetoCommitSave113=({canSave,save,onStatus=()=>{},delay=750})=>{
  let version=0,saved=0,timer=0,running=null,disposed=false,failed=false;
  const emit=(state,error)=>onStatus(state,error);
  async function drain(){
   clearTimeout(timer);timer=0;if(disposed||!canSave())return false;
   if(running)return running;
   running=(async()=>{while(!disposed&&saved<version){if(!canSave())return false;const target=version;emit('saving');try{await save();saved=target;failed=false;emit(saved===version?'saved':'pending');}catch(error){failed=true;emit('error',error);return false;}}return true;})();
   try{return await running;}finally{running=null;}
  }
  return {
   mark(){if(disposed)return;version++;failed=false;clearTimeout(timer);emit('pending');timer=setTimeout(()=>void drain(),delay);},
   flush(){if(disposed)return Promise.resolve(false);if(saved===version&&!running)version++;return drain();},
   get pending(){return saved<version||!!running;},get failed(){return failed;},
   dispose(){disposed=true;clearTimeout(timer);}
  };
 };
})();
