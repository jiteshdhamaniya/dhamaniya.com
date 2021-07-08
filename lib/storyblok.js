import StoryblokClient from 'storyblok-js-client'
 
const Storyblok = new StoryblokClient({
    accessToken: 'hLQg6JMf1sdwEiGNlT6YSgtt',
    cache: {
      clear: 'auto',
      type: 'memory'
    }
})
 
export default Storyblok
