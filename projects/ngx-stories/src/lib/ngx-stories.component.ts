import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HammerModule } from '@angular/platform-browser';
import { Person } from '../lib/interfaces/interfaces';
import "hammerjs";

@Component({
  selector: 'ngx-stories',
  standalone: true,
  imports: [RouterOutlet, HammerModule],
  templateUrl: './ngx-stories.component.html',
  styleUrl: './ngx-stories.component.scss',
})
export class NgxStoriesComponent implements AfterViewInit {
  title = 'story-component';
  @Input({ required: true }) persons: Person[] = [];
  @Output() triggerOnEnd = new EventEmitter<void>();
  @Output() triggerOnExit = new EventEmitter<void>();
  @Output() triggerOnSwipeUp = new EventEmitter<void>();

  currentStoryIndex: number = 0;
  currentPersonIndex: number = 0;
  progressWidth: number = 0;
  intervalId: any;
  isTransitioning = false;
  isSwipingLeft = false;
  isSwipingRight = false;
  isHolding = false;
  holdTimeout: any;
  isPaused: boolean = false;
  pauseImg: string = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWgAAAFoBAMAAACIy3zmAAAAFVBMVEUzMzPu7u7///8mJia3t7dkZGRHR0dSv6pTAAADk0lEQVR42u2Y3U7jMBCFLcw+QAzlem2lXBu5yTW0cA8NPADk/d+B/u3FSrUnSzubtvqsSjSIGX85PbiZY8J2+Wq7zuLSAA000EADDTTQQAN9idC7n273+7O4BBpooIEGGmiggQb6IqEZAoAGGmiggQYaaKCBJjVlcgEaaKCBBhpooIEGmtQUaKCBBvqyofcsf0Dt+ttDE/r25WPvend+ALR/zlQ/BT3oMOlTZjVzL0LXr7nq+KYG7SYpRrNa0e5euxWNXVFL0L5LdlX+d+36vYkpLbWgfRdNdqVrL7R6LFTbxulAu7vCriut5+VWdSpUm/SpA+370q7Gzoqt3CIWqxud1HRa3NWY1pVaCbds0lJlCLiJQ7bNtZJu2c68BnRnhPXgC62kWzaNBrS3EvSsBL2QqqNTgK4lqUxbgu6l6jRXgJ6K0LHUSvyc7HIc6Hm+lU+jQN+L0LYALZvLfilA/9aGvhoFOh0Eba5Q+v9Am3O0B0qfotKDn6eHKJ1vNQRaYQjQhjbnCI3Sw6ETSh8D2uFpPM05jdJ4Gk8fPTVlsGXcYrDF08RiKI3SKI3SPHvoKs3kwuSC0nia1BRPozTnNJ5GaVJTJhdSU5TG05weKI3SKI3SfCOSmjK5oDSeJjXF0yjNOY2nUZrUlMmF1BSl8TSnB0qjNEqjNN+IpKZMLiiNp0lN8TRKc07jaZQmNWVyIcsjNcXTnB4ojdIojdI8e5CaMrmgNJ4mNcXTeJpzGk+jNKkpkwtZHqkpnub0QGmURmmU5tmD1JTJBaXxNKkpnsbTnNN4GqVJTZlcyPJITfE0pwdKozRKozTPHqSmTC4ozTSOp48Lfa8N/aUAPZU97Q6CXo4CHQutvB0FWtaqLbRy/SBzHRu6krSysxL0QvycnAK06yTohxL0jfRBNUEDehEHmDLbSvqX2N7y0e0hbdu6UivfD7nlY6emIfSCpX2xlfBBta5SGAJCuIsDhq1sqzoVb/nT60D7rkCdroWd3GOh2m6FVoAO05TdNzVO2Kmqu6zWNr15Legw6VNm/ZpLtZWrX3PV7Vuo1KDD7cvH3vXsxNrVO5+pfn8KlR70+uxxzv+5BR/c5jWsdnN0/bz259CbE/df/ljl0oy1MdBAAw30CNDDn6dP5xJooIEGGmiggQYa6IuEZggAGmiggQYaaKCBBprUlMkFaKCBBhpooIEGGmhSU6CBBhpooIEGGmigT+/yG22PL5G02uQ1AAAAAElFTkSuQmCC';
  playImg: string = 'data:image/jpeg;base64,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';
  toggleBtnImg = this.pauseImg;
  @ViewChildren('storyContainer') storyContainers!: QueryList<ElementRef>;

  constructor(
  ) { }

  ngOnInit(): void {
    this.startStoryProgress();
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  ngAfterViewInit(): void {
    this.initHammer();
  }

  startStoryProgress() {
    this.intervalId && clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      this.progressWidth += 1;
      if (this.progressWidth >= 100) {
        this.nextStory();
      }
    }, 50);
  }

  initHammer() {
    this.storyContainers?.forEach(storyContainer => {
      const hammer = new Hammer(storyContainer.nativeElement);
      hammer.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
      hammer.on('swipeleft', () => this.handleSwipe('left'));
      hammer.on('swiperight', () => this.handleSwipe('right'));
      hammer.on('swipedown', () => this.handleSwipe('down'));
      hammer.on('swipeup', () => this.handleSwipe('up'));
    });
  }

  handleSwipe(direction: string) {
    if (direction === 'left') {
      this.isSwipingLeft = true;
      setTimeout(() => {
        if (this.currentPersonIndex === this.persons.length - 1) {
          let stories = this.persons.find((person, index) => index === this.currentPersonIndex)?.stories;
          this.currentStoryIndex = Number(stories?.length) - 1;
          if (this.checkEnd()) return;
        }
        this.nextPersonStory();
        this.resetSwipe();
      }, 600); // Match the animation duration
    } else if (direction === 'right') {
      this.isSwipingRight = true;
      setTimeout(() => {
        this.prevPersonStory();
        this.resetSwipe();
      }, 600); // Match the animation duration
    } else if (direction === 'down') {
      clearInterval(this.intervalId);
      this.onExit();
    } else if (direction === 'up') {
      this.onSwipeUpTriggered();
    }
  }

  resetSwipe() {
    this.isSwipingLeft = false;
    this.isSwipingRight = false;
  }

  nextStory() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    clearInterval(this.intervalId);
    if (this.checkEnd()) { 
      this.isTransitioning = false; 
      return;
    }
    let stories = this.persons.find((person, index) => index === this.currentPersonIndex)?.stories;

    if (Number(stories?.length) - 1 === this.currentStoryIndex) {
      this.currentPersonIndex = (this.currentPersonIndex + 1) % this.persons.length;
      stories = this.persons.find((person, index) => index === this.currentPersonIndex)?.stories;
      this.currentStoryIndex = 0;
    } else {
      this.currentStoryIndex = (this.currentStoryIndex + 1) % stories!.length;
    }
    this.progressWidth = 0;
    setTimeout(() => {
      this.startStoryProgress();
      this.isTransitioning = false;
    }, 500); // Match this timeout with the CSS transition duration
  }

  prevStory() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    clearInterval(this.intervalId);

    let stories = this.persons[this.currentPersonIndex]?.stories;

    if (this.currentStoryIndex === 0) {
      // Move to the previous person if the current story index is 0
      if (this.currentPersonIndex > 0) {
        this.currentPersonIndex--;
        stories = this.persons[this.currentPersonIndex]?.stories;
        this.currentStoryIndex = stories?.length ? stories.length - 1 : 0;
      }
    } else {
      // Otherwise, just move to the previous story within the same person
      this.currentStoryIndex--;
    }

    this.progressWidth = 0;
    setTimeout(() => {
      this.startStoryProgress();
      this.isTransitioning = false;
    }, 500); // Match this timeout with the CSS transition duration
  }


  nextPersonStory() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.currentPersonIndex = (this.currentPersonIndex + 1) % this.persons.length;
    if (this.checkEnd()) return;
    this.currentStoryIndex = 0;
    clearInterval(this.intervalId);
    this.progressWidth = 0;
    setTimeout(() => {
      this.startStoryProgress();
      this.isTransitioning = false;
    }, 500); // Match this timeout with the CSS transition duration
  }

  prevPersonStory() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.currentStoryIndex = 0;
    clearInterval(this.intervalId);
    if (this.currentPersonIndex !== 0 && this.persons.length > this.currentPersonIndex) {
      this.currentPersonIndex--;
    }
    this.progressWidth = 0;
    setTimeout(() => {
      this.startStoryProgress();
      this.isTransitioning = false;
    }, 500); // Match this timeout with the CSS transition duration
  }

  checkEnd(): boolean {
    let stories = this.persons.find((person, index) => index === this.currentPersonIndex)?.stories;
    if (this.currentStoryIndex === Number(stories?.length) - 1 && this.currentPersonIndex === this.persons.length - 1) {
      this.onEnd();
      return true;
    }
    return false;
  }

  getProgressValue(storyIndex: number): number {
    if (this.isHolding) return this.progressWidth;
    if (storyIndex < this.currentStoryIndex) {
      return 100;
    } else if (storyIndex === this.currentStoryIndex) {
      return this.progressWidth;
    } else {
      return 0;
    }
  }

  onTouchStart() {
    this.holdTimeout = setTimeout(() => {
      this.onHold();
    }, 500);  // 500ms delay
  }

  onHold() {
    this.isHolding = true;
    clearInterval(this.intervalId);
  }

  onRelease() {
    this.isHolding = false;
    clearTimeout(this.holdTimeout);  // Cancel hold if user releases before 1 second
    this.startStoryProgress();
  }

  disableContextMenu(event: MouseEvent) {
    event.preventDefault();
  }

  togglePause() {
    if (this.isPaused) {
      this.isPaused = false;
      this.toggleBtnImg = this.pauseImg;
      this.startStoryProgress();
    } else {
      this.isPaused = true;
      this.toggleBtnImg = this.playImg;
      clearInterval(this.intervalId);
    }
  }

  onEnd() {
    this.triggerOnEnd.emit();
  }

  onExit() {
    // Swipe down event
    this.triggerOnExit.emit();
  }

  onSwipeUpTriggered() {
    this.triggerOnSwipeUp.emit();
  }
}
