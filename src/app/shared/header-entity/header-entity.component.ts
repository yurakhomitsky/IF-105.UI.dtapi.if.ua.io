import { Component, OnInit, Input, Output,EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header-entity',
  templateUrl: './header-entity.component.html',
  styleUrls: ['./header-entity.component.scss']
})
export class HeaderEntityComponent implements OnInit {
  @Input() entityName: string;
  @Input() buttonName: string;
  @Output() buttonClick = new EventEmitter();
  constructor() { }

  ngOnInit(): void {
  }
  addButtonWasClicked() {
    this.buttonClick.emit();
  }
}
