import {animate,state,style,transition,trigger} from '@angular/animations';

export function RouterTransition(){
  return slideToTop();
}

export function slideToRight(){
 return trigger('routerTransition',[state('void',style({}))]),state('*',style({})),transition(':enter',[style({transform:'translateX(-0%)'})]),
 transition('leave',[])
}

export function slideToLeft(){

}

export function slideToTop(){

}
export function slideToBottom(){

}
