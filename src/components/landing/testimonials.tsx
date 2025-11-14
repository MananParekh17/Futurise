"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Aisha Khan",
    title: "Engineering Student",
    quote: "Futurise gave me the clarity I was missing. The skill gap analysis was a game-changer for my internship preparations.",
    avatar: "AK",
  },
  {
    name: "Ben Carter",
    title: "Commerce Graduate",
    quote: "I was overwhelmed with career choices. The psychometric test pointed me towards finance, and I've never looked back!",
    avatar: "BC",
  },
  {
    name: "Chloe Davis",
    title: "Arts Major",
    quote: "I discovered a passion for UX design through Futurise. The daily learning content is fantastic and keeps me motivated.",
    avatar: "CD",
  },
  {
    name: "David Rodriguez",
    title: "Medical Aspirant",
    quote: "The community support is amazing. I connected with a mentor who has been invaluable in my journey.",
    avatar: "DR",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 sm:py-32">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-headline text-3xl md:text-4xl font-bold">Loved by Students Worldwide</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Hear what our users have to say about their journey with Futurise.
          </p>
        </div>
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full max-w-4xl mx-auto"
        >
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card>
                    <CardContent className="flex flex-col items-start gap-4 p-6">
                      <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                      <div className="flex items-center gap-4 mt-auto">
                        <Avatar>
                          <AvatarImage src={`https://picsum.photos/id/${100 + index}/40/40`} />
                          <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold font-headline">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}
