/* Expose the existing history; keep async undo requests in order. */
export function installCityUndo118(game){
 const editor=game.editor,button=editor.panel.querySelector('[data-action="undo"]');if(!button)return;
 const row=document.createElement('div');row.className='editor-undo118';button.parentElement.removeChild(button);row.append(button);editor.panel.querySelector('.inspector-save').before(row);
 button.style.cssText='width:100%;display:flex;align-items:center;justify-content:center;gap:8px;min-height:38px;margin-bottom:8px;border:1px solid #91b4a4;border-radius:9px;background:#eef6f1;color:#245640;font:600 12px Vazirmatn,Tahoma,sans-serif';
 button.innerHTML='<span aria-hidden="true">↶</span><span>بازگردانی (Undo)</span><kbd dir="ltr">Ctrl+Z</kbd><bdi></bdi>';
 button.querySelector('kbd').style.cssText='font:11px Tahoma;color:#245640;background:#fff;border:1px solid #aec4b9;border-radius:5px;padding:2px 5px';
 button.title='بازگردانی آخرین تغییر در همین نشست؛ Ctrl+Z';button.setAttribute('aria-label','بازگردانی آخرین ویرایش');
 const badge=button.querySelector('bdi'),refresh=editor.refreshButtons,undo=editor.undo;let undoing=false;
 function update(){const depth=editor.undoStack.length;button.disabled=undoing||!depth||!editor.available||!editor.store.canSave;badge.textContent=depth?'· '+depth.toLocaleString('fa-IR'):'';button.setAttribute('aria-busy',String(undoing));}
 editor.refreshButtons=function(...args){const r=refresh.apply(this,args);update();return r;};
 editor.undo=async function(...args){if(undoing||!this.available||!this.store.canSave||!this.active||!this.undoStack.length)return false;undoing=true;this.refreshButtons();try{await undo.apply(this,args);return true;}finally{undoing=false;this.refreshButtons();}};
 update();game.disposers.push(()=>{editor.refreshButtons=refresh;editor.undo=undo;});return {button,get busy(){return undoing;}};
}
