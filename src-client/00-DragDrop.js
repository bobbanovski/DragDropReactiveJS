import $ from "jquery";
//import reactive extensions - entire bundle
import Rx from "rxjs/Rx";
import {createSubscriber} from "./lib/util";

const $drag = $("#drag");
const $document = $(document);
const $dropAreas = $(".droparea");

const beginDrag$ = Rx.Observable.fromEvent($drag, "mousedown");
const endDrag$ = Rx.Observable.fromEvent($document, "mouseup");
const mouseMove$ = Rx.Observable.fromEvent($document, "mousemove");

const currentOverArea$ = Rx.Observable.merge(
    Rx.Observable.fromEvent($dropAreas, "mouseover").map(e => $(e.target)), //produce jquery object of 
    //item that mouse was over
    Rx.Observable.fromEvent($dropAreas, "mouseout").map(e => null)
);

const drops$ = beginDrag$
    .do(e => {
        e.preventDefault();
        $drag.addClass("dragging");
    })
    .mergeMap(startEvent => {
        return mouseMove$
            .takeUntil(endDrag$)
            .do(moveEvent => moveDrag(startEvent, moveEvent)) //side effect
            .last() //prevents being sent to subscription until complete
            .withLatestFrom(currentOverArea$, (_, $area) => $area);//_ - dont care about this parameter
    })
    .do(() => {
        $drag.removeClass("dragging")
            .animate({ top: 0, left: 0 }, 250); // animates to top left of screen
    });

    drops$.subscribe($dropArea => {
        console.log($dropArea);
        $dropAreas.removeClass("dropped");
        if ($dropArea) $dropArea.addClass("dropped");
    });

    function moveDrag(startEvent, moveEvent) {
        $drag.css({
            left: moveEvent.clientX - startEvent.offsetX,
            top: moveEvent.clientY - startEvent.offsetY
        })
    }