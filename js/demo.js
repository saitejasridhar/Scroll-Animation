
{
    
    const MathUtils = {
       
        map: (x, a, b, c, d) => (x - a) * (d - c) / (b - a) + c,
     
        lerp: (a, b, n) => (1 - n) * a + n * b,
     
        getRandomFloat: (min, max) => (Math.random() * (max - min) + min).toFixed(2)
    };

   
    const body = document.body;
    
   
    let winsize;
    const calcWinsize = () => winsize = {width: window.innerWidth, height: window.innerHeight};
    calcWinsize();
    
    window.addEventListener('resize', calcWinsize);
    
   
    let docScroll;
   
    let lastScroll;
    let scrollingSpeed = 0;
    
    const getPageYScroll = () => docScroll = window.pageYOffset || document.documentElement.scrollTop;
    window.addEventListener('scroll', getPageYScroll);

    
    class Item {
        constructor(el) {
          
            this.DOM = {el: el};
           
            this.DOM.image = this.DOM.el.querySelector('.content__item-img');
            this.DOM.imageWrapper = this.DOM.image.parentNode;
            this.DOM.title = this.DOM.el.querySelector('.content__item-title');
            this.renderedStyles = {
           
                imageScale: {
                  
                    previous: 0, 
                   
                    current: 0, 
             
                    ease: 0.1,

                    setValue: () => {
                        const toValue = 1.5;
                        const fromValue = 1;
                        const val = MathUtils.map(this.props.top - docScroll, winsize.height, -1 * this.props.height, fromValue, toValue);
                        return Math.max(Math.min(val, toValue), fromValue);
                    }
                },
                titleTranslationY: {
                    previous: 0, 
                    current: 0, 
                    ease: 0.1,
                    fromValue: Number(MathUtils.getRandomFloat(30,400)),
                    setValue: () => {
                        const fromValue = this.renderedStyles.titleTranslationY.fromValue;
                        const toValue = -1*fromValue;
                        const val = MathUtils.map(this.props.top - docScroll, winsize.height, -1 * this.props.height, fromValue, toValue);
                        return fromValue < 0 ? Math.min(Math.max(val, fromValue), toValue) : Math.max(Math.min(val, fromValue), toValue);
                    }
                }
            };

            this.getSize();

            this.update();

            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => this.isVisible = entry.intersectionRatio > 0);
            });
            this.observer.observe(this.DOM.el);
           
            this.initEvents();
        }
        update() {
    
            for (const key in this.renderedStyles ) {
                this.renderedStyles[key].current = this.renderedStyles[key].previous = this.renderedStyles[key].setValue();
            }
           
            this.layout();
        }
        getSize() {
            const rect = this.DOM.el.getBoundingClientRect();
            this.props = {

                height: rect.height,

                top: docScroll + rect.top
            }
        }
        initEvents() {
            window.addEventListener('resize', () => this.resize());
        }
        resize() {

            this.getSize();

            this.update();
        }
        render() {

            for (const key in this.renderedStyles ) {
                this.renderedStyles[key].current = this.renderedStyles[key].setValue();
                this.renderedStyles[key].previous = MathUtils.lerp(this.renderedStyles[key].previous, this.renderedStyles[key].current, this.renderedStyles[key].ease);
            }
            

            this.layout();
        }
        layout() {

            this.DOM.image.style.transform = `scale3d(${this.renderedStyles.imageScale.previous},${this.renderedStyles.imageScale.previous},1)`;

            this.DOM.title.style.transform = `translate3d(0,${this.renderedStyles.titleTranslationY.previous}px,0)`;
        }
    }

    class SmoothScroll {
        constructor() {

            this.DOM = {main: document.querySelector('main')};

            this.DOM.scrollable = this.DOM.main.querySelector('div[data-scroll]');

            this.items = [];
            this.DOM.content = this.DOM.main.querySelector('.content');
            [...this.DOM.content.querySelectorAll('.content__item')].forEach(item => this.items.push(new Item(item)));

            this.renderedStyles = {
                translationY: {

                    previous: 0, 
                    ease: 0.1,
                    
                    setValue: () => docScroll
                }
            };
            
            this.setSize();
            
            this.update();
            
            this.style();
            
            this.initEvents();
            
            requestAnimationFrame(() => this.render());
        }
        update() {
         
            for (const key in this.renderedStyles ) {
                this.renderedStyles[key].current = this.renderedStyles[key].previous = this.renderedStyles[key].setValue();   
            }   
            
            this.layout();
        }
        layout() {
            this.DOM.scrollable.style.transform = `translate3d(0,${-1*this.renderedStyles.translationY.previous}px,0)`;
        }
        setSize() {
            
            body.style.height = `${this.DOM.scrollable.scrollHeight}px`;
        }
        style() {
 
            this.DOM.main.style.position = 'fixed';
            this.DOM.main.style.width = this.DOM.main.style.height = '100%';
            this.DOM.main.style.top = this.DOM.main.style.left = 0;
            this.DOM.main.style.overflow = 'hidden';
        }
        initEvents() {

            window.addEventListener('resize', () => this.setSize());
        }
        render() {
            
            scrollingSpeed = Math.abs(docScroll - lastScroll);
            lastScroll = docScroll;
            
      
            for (const key in this.renderedStyles ) {
                this.renderedStyles[key].current = this.renderedStyles[key].setValue();
                this.renderedStyles[key].previous = MathUtils.lerp(this.renderedStyles[key].previous, this.renderedStyles[key].current, this.renderedStyles[key].ease);    
            }

            this.layout();
            

            for (const item of this.items) {
                
                if ( item.isVisible ) {
                    if ( item.insideViewport ) {
                        item.render();
                    }
                    else {
                        item.insideViewport = true;
                        item.update();
                    }
                }
                else {
                    item.insideViewport = false;
                }
            }
            

            requestAnimationFrame(() => this.render());
        }
    }


    const preloadImages = () => {
        return new Promise((resolve, reject) => {
            imagesLoaded(document.querySelectorAll('.content__item-img'), {background: true}, resolve);
        });
    };
    

    preloadImages().then(() => {

        document.body.classList.remove('loading');

        getPageYScroll();
        lastScroll = docScroll;
        new SmoothScroll();
    });
}